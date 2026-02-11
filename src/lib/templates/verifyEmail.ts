export const verifyEmailTemplate = ({
  url,
  name,
  email,
}: {
  url: string;
  name: string;
  email: string;
}) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu correo electrónico</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Visoria Medical</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Verifica tu correo electrónico</h2>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hola ${name},</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Gracias por registrarte en Visoria Medical. Para completar tu registro y acceder a tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verificar correo electrónico</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
              <p style="margin: 10px 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">${url}</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Si no creaste una cuenta en Visoria Medical, puedes ignorar este correo electrónico de forma segura.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Este correo fue enviado a <strong>${email}</strong></p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Visoria Medical. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
