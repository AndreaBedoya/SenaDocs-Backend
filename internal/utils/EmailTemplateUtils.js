/**
 * Template para email de recuperacion de contraseña
 */
const resetPasswordTemplate = (userName, resetUrl, expiresIn) => {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - SenaDocs</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #39a900 0%, #2d8700 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            color: #333;
            line-height: 1.6;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 20px 0;
            background: linear-gradient(135deg, #39a900 0%, #2d8700 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #2d8700 0%, #1f5f00 100%);
          }
          .alert {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert p {
            margin: 0;
            color: #856404;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer a {
            color: #39a900;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperar Contraseña</h1>
            <p>SenaDocs - SENA</p>
          </div>
        
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
          
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en SenaDocs.</p>
          
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
            <center>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </center>
          
            <div class="alert">
              <p><strong>⏰ Este enlace expirará en ${expiresIn} minutos.</strong></p>
            </div>
          
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #39a900;">${resetUrl}</p>
          
            <p><strong>¿No solicitaste este cambio?</strong></p>
            <p>Si no fuiste tú, ignora este mensaje y tu contraseña permanecerá sin cambios. Por seguridad, te recomendamos cambiar tu contraseña lo antes posible.</p>
          </div>
        
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
            <p>© ${new Date().getFullYear()} SenaDocs - SENA. Todos los derechos reservados.</p>
            <p><a href="${process.env.FRONTEND_URL}">Visitar SenaDocs</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

};

/**
 * Template para confirmar cambio de contraseña
 */
const passwordChangedTemplate = (userName) => {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contraseña Cambiada - SenaDocs</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);}
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            color: #333;
            line-height: 1.6;
            font-size: 16px;
          }
          .success-icon {
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Contraseña Actualizada</h1>
            <p>SenaDocs - SENA</p>
          </div>
        
          <div class="content">
            <div class="success-icon">🎉</div>
          
            <p>Hola<strong>${userName}</strong>,</p>
          
            <p>Te confirmamos que tu contraseña ha sido  cambiada exitosamente.</p>
          
            <p>Ya puedes iniciar sesion en SenaDocs con tu nueva contraseña.</p>
          
            <p><strong>¿No realizaste este cambio?</strong></p>
            <p>Si no fuiste tu quien cambio la contraseña, por favor contacta inmediatamente al administrador del sistema.</p>
          </div>
        
          <div class="footer">
            <p>Este es un mensaje automatico, por favor no respondas a este correo.</p>
            <p>${new Date().getFullYear()} SenaDocs - SENA.</p>  
          </div>
        </div>
      </body>
      </html>
  `;
};

module.exports = {
    passwordChangedTemplate,
    resetPasswordTemplate,
}
