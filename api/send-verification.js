import crypto from 'crypto';
import { sql, ensureTables } from './_db.js';

export async function dispatchVerificationEmail(user, req) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.MAIL_FROM || 'RELOOT <onboarding@resend.dev>';
    const origin =
        process.env.APP_URL ||
        (req.headers.origin ? req.headers.origin : `https://${req.headers.host}`);

    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await sql`
    UPDATE users
    SET verification_token = ${token}, verification_expires = ${expires}
    WHERE id = ${user.id}
  `;

    const verifyUrl = `${origin}/?verify_token=${token}`;

    if (!apiKey) {
        return {
            sent: false,
            reason: 'RESEND_API_KEY no configurada en variables de entorno',
            verifyUrl
        };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [user.email],
            subject: 'Verifica tu cuenta en RELOOT',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-top: 0;">Hola, ${user.name}</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Gracias por registrarte en <strong>RELOOT</strong>. Confirma tu correo electrónico para activar tu cuenta:
          </p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Verificar mi correo
            </a>
          </p>
          <p style="color: #64748b; font-size: 12px;">
            Este enlace vence en 24 horas. Si tú no creaste esta cuenta, puedes ignorar este mensaje.
          </p>
        </div>
      `
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        return {
            sent: false,
            reason: `Error de Resend: ${errText}`,
            verifyUrl
        };
    }

    return { sent: true };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        await ensureTables();
        const { email } = req.body || {};
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({ error: 'Ingresa tu correo electrónico' });
        }

        const rows = await sql`
      SELECT id, name, email, is_verified FROM users WHERE email = ${normalizedEmail}
    `;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No existe una cuenta con ese correo' });
        }

        const user = rows[0];
        if (user.is_verified) {
            return res.status(200).json({ message: 'Tu correo ya está verificado. Ya puedes iniciar sesión.' });
        }

        const mailResult = await dispatchVerificationEmail(user, req);
        if (!mailResult.sent) {
            return res.status(200).json({
                message: 'Enlace generado. Configura RESEND_API_KEY en Vercel para envío automático por correo.',
                verifyUrl: mailResult.verifyUrl
            });
        }

        return res.status(200).json({ message: 'Te enviamos un nuevo correo de verificación.' });
    } catch {
        return res.status(500).json({ error: 'No se pudo enviar el correo de verificación' });
    }
}