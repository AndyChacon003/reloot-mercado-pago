import jwt from 'jsonwebtoken';
import { sql, ensureTables } from './_db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reloot_secret_key_2026';

function getAuthUser(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    try {
        await ensureTables();

        if (req.method === 'POST') {
            const { category, model, expectedPrice, contact, imageData } = req.body || {};
            const numericPrice = Number(expectedPrice);

            if (!model || String(model).trim().length < 2) {
                return res.status(400).json({ error: 'Ingresa el modelo exacto del equipo' });
            }
            if (!numericPrice || numericPrice <= 0) {
                return res.status(400).json({ error: 'Ingresa un precio esperado válido' });
            }
            if (!contact || String(contact).trim().length < 3) {
                return res.status(400).json({ error: 'Ingresa tu WhatsApp o correo de contacto' });
            }

            const authUser = getAuthUser(req);

            const inserted = await sql`
        INSERT INTO sell_quotes (user_id, category, model, expected_price, contact, image_data, status)
        VALUES (
          ${authUser ? authUser.userId : null},
          ${String(category || 'Componente de PC (GPU, CPU, RAM, Motherboard)')},
          ${String(model).trim()},
          ${numericPrice},
          ${String(contact).trim()},
          ${imageData || null},
          'pendiente'
        )
        RETURNING id, category, model, expected_price, contact, status, created_at
      `;

            return res.status(201).json({ quote: inserted[0], message: 'Cotización enviada correctamente' });
        }

        if (req.method === 'GET') {
            const authUser = getAuthUser(req);
            if (!authUser) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const rows = await sql`SELECT role FROM users WHERE id = ${authUser.userId}`;
            if (rows.length === 0 || rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Acceso restringido a administradores' });
            }

            const quotes = await sql`
        SELECT id, user_id, category, model, expected_price, contact, image_data, status, created_at
        FROM sell_quotes
        ORDER BY created_at DESC
      `;

            return res.status(200).json({ quotes });
        }

        if (req.method === 'PATCH') {
            const authUser = getAuthUser(req);
            if (!authUser) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const rows = await sql`SELECT role FROM users WHERE id = ${authUser.userId}`;
            if (rows.length === 0 || rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Acceso restringido a administradores' });
            }

            const { id, status } = req.body || {};
            const allowed = ['pendiente', 'aprobado', 'rechazado'];
            if (!id || !allowed.includes(status)) {
                return res.status(400).json({ error: 'Datos inválidos para actualizar estado' });
            }

            const updated = await sql`
        UPDATE sell_quotes
        SET status = ${status}
        WHERE id = ${Number(id)}
        RETURNING id, status
      `;

            if (updated.length === 0) {
                return res.status(404).json({ error: 'Cotización no encontrada' });
            }

            return res.status(200).json({ quote: updated[0] });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch {
        return res.status(500).json({ error: 'Error de servidor en cotizaciones' });
    }
}