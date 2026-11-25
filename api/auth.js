import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, ensureTables } from './_db.js';
import { dispatchVerificationEmail } from './send-verification.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reloot_secret_key_2026';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        await ensureTables();

        const { mode, name, email, password } = req.body || {};
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: 'Correo y contraseña requeridos' });
        }

        if (mode === 'register') {
            if (!name || String(name).trim().length < 2) {
                return res.status(400).json({ error: 'Ingresa tu nombre completo' });
            }

            const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`;
            if (existing.length > 0) {
                return res.status(409).json({ error: 'Ese correo ya está registrado en RELOOT' });
            }

            const passwordHash = await bcrypt.hash(String(password), 10);
            const created = await sql`
        INSERT INTO users (name, email, password_hash, role, is_verified)
        VALUES (${String(name).trim()}, ${normalizedEmail}, ${passwordHash}, 'user', FALSE)
        RETURNING id, name, email, role, is_verified, created_at
      `;

            const user = created[0];
            const mailResult = await dispatchVerificationEmail(user, req);

            return res.status(201).json({
                requiresVerification: true,
                email: user.email,
                mailSent: mailResult.sent,
                verifyUrl: mailResult.sent ? undefined : mailResult.verifyUrl,
                message: mailResult.sent
                    ? 'Cuenta creada. Revisa tu correo y haz clic en el enlace para verificarla.'
                    : 'Cuenta creada. Configura RESEND_API_KEY en Vercel para enviar correos automáticamente.'
            });
        }

        const found = await sql`
      SELECT id, name, email, password_hash, role, is_verified, created_at
      FROM users
      WHERE email = ${normalizedEmail}
    `;

        if (found.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const dbUser = found[0];
        const valid = await bcrypt.compare(String(password), dbUser.password_hash);

        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (dbUser.is_verified === false && dbUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
                requiresVerification: true,
                email: dbUser.email
            });
        }

        const user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role || 'user',
            is_verified: dbUser.is_verified,
            created_at: dbUser.created_at
        };

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({ token, user });
    } catch {
        return res.status(500).json({ error: 'Error de servidor en autenticación' });
    }
}