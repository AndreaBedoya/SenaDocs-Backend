const { sendEmail } = require("../utils/EmailUtils");
// const { resetPasswordTemplate, passwordChangedTemplate } require("../utils/EmailTemplate.js");

class EmailService {
    /**
     * Enviar email de recuperacion password.
     */
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            const expireIn = process.env.RESET_PASSWORD_EXPIRES||60;
            const userName =`${user.nombre}, ${user.apellido}`;

            //const html = resetPasswordTemplate(userName,resetUrl, expireIn);

            await sendEmail({
                to:user.email,
                subject: "Recupera tu contraseña - SenaDocs",
                //html,
                text: `Hola${user.name},

                Recibimos una solicitud para restablecer tu contraseña.
                
                Visita este enlace para crear una nueva contraseña:
                ${resetUrl}
                
                Este enlace expirara en ${expireIn} minutos.
                
                Si no solicitas este cambio, ignora el mensaje,
                
                Saludos,
                
                Equipo SenaDocs`
            });

            console.log(`Email de recuperacion enviado a ${user.email}`);
            return true;
        } catch (error) {
            console.error("Error al enviar email de recuperacion:", error);
            throw new Error("No se pudo enviar el email de recuperacion");
        }
    }

    /**
     * Enviar email de confirmacion de cambio de password.
     */
    async sendPasswordChangedEmail(user) {
        try {
            const userName = `${user.nombre}, ${user.apellido}`;
            //const html = passwordChangedTemplate(Username);

            await sendEmail({
                to: user.email,
                subject: "Contraseña actualizada",
                html,
                text: `Hola ${userName},
                
                Te confirmamos que tu contraseña ha sido cambiada exitosamente
                
                Si no realizaste este cambio, contaacta inmediamente al administrador.
                
                Saludos, 
                
                Equipo SenaDocs`
            });

            console.log(`Email de confirmacion enviado a: ${user.email}`);
            return true;
        } catch (error) {
            console.error("Error al enviar email de confirmacion:", error);
            return false;
        }
    }
}

module.exports = new EmailService();