import { sql, ensureTables } from './_db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        await ensureTables();
        const token =
            (req.method === 'GET' ? req.query?.token : req.body?.token) || '';

        if (!token || String(token).trim().length < 10) {
            return res.status(400).json({ error: 'Token de verificación inválido' });
        }

        const rows = await sql`
      SELECT id, name, email, verification_expires
      FROM users
      WHERE verification_token = ${String(token).trim()}
    `;

        if (rows.length === 0) {
            return res.status(400).json({ error: 'El enlace de verificación no es válido o ya fue usado' });
        }

        const user = rows[0];
        if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
            return res.status(400).json({ error: 'El enlace de verificación ha expirado. Solicita uno nuevo.' });
        }

        await sql`
      UPDATE users
      SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL
      WHERE id = ${user.id}
    `;

        return res.status(200).json({
            verified: true,
            message: 'Correo verificado correctamente. Ya puedes iniciar sesión.'
        });
    } catch {
        return res.status(500).json({ error: 'Error al verificar el correo' });
    }
}