import jwt from 'jsonwebtoken';
import { sql, ensureTables } from './_db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reloot_secret_key_2026';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        await ensureTables();
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const rows = await sql`
      SELECT id, name, email, created_at FROM users WHERE id = ${decoded.userId}
    `;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json({ user: rows[0] });
    } catch {
        return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
}