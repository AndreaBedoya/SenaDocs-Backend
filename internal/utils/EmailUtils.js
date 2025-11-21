const nodemail = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 *
 * @Configuration
 * public class EmailConfig {
 *     @Bean
 *     public JavaMailSender getMailSender() {
 *         JavaMailSenderlmpl MailSender = new JavaMailSenderlmpl();
 *         mailSender.setHost("smpt.gmail.com");
 *         //...
 *         return mailSender;
 *     }
 * }
 */

const transporter=nodemail.createTransport({
    host: process.env.EMAIL_HOST||"smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT)||587,
    secure: process.env.EMAIL_SECURE==="true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const verifyEmailConnection= async ()=> {
    try {
        await transporter.verify();
        console.log("Servidor de email listo para enviar mensajes");
        return true;
    } catch (error) {
        console.error("Error al conectar con el servidor email: ", error)
        return false;
    }
};

const sendEmail = async (options)=>{
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_HOST}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info=await transporter.sendMail(mailOptions);
        console.log("Email enviado: ", info.messageId);
        return {success: true, messageId:info.messageId};
    } catch (error) {
        console.error("Error al enviar email", error);
        throw new Error("No se puedo enviar el email");
    }
};

module.exports = {
    verifyEmailConnection,
    sendEmail,
    transporter,
}