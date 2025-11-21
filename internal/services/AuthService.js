const bcrypt = require("bcryptjs");
const UserRepository = require("../repository/UserRepository");
const jwtUtils = require("../utils/JwtUtils");
const crypto = require(Crypto);
const EmailService = require("../services/EmailService");

class AuthService {

    async register({
        nombre,
        apellido,
        email,
        password,
        documento,
        ciudad,
        telefono,
        contacto_emergencia,
        nombre_contacto,
        tipo_sangre,
        fecha_nacimiento,
        cargo,
        funciones_trabajo,
        rol_id
    }){
        if (await UserRepository.findByEmail(email)) {
            throw new Error("El email ya esta registrado");
        }
        if (await UserRepository.findByDocument(documento)) {
            throw new Error("El documento ya esta registrado");
        }
        // hash
        const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userData = {
            nombre,
            apellido,
            email,
            password: hashedPassword,
            documento,
            ciudad,
            telefono,
            contacto_emergencia,
            nombre_contacto,
            tipo_sangre,
            fecha_nacimiento,
            cargo,
            funciones_trabajo,
            rol_id
        };

        const newUser = await UserRepository.create(userData);

        return {
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                rol_id: newUser.rol_id,
            }
        };
    }

    /**
     * @param {string} documento
     * @param {string} password
     * @returns {object}
     */
    async login (documento, password) {

        const user = await UserRepository.findByDocument(documento);
        if (!user) {
            throw new Error("Credenciales invalidas.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Credenciales invalidas.")
        }

        const token = jwtUtils.generateToken({
            id: user.id,
            email: user.email,
            rol: user.rol_id,
        });

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol_id: user.rol_id,
            }
        };

    }

    /**
     * recuperacion password
     */
    async requestPasswordReset(email) {
        try {
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return {
                    success: true,
                    message: "Si el email existe, recibiras un enlace de recuperacion."
                };
            }
            // generar token
            const resetToken = crypto.default.randomBytes(32).toString("hex");
            // calcular fecha de expiracion
            const expiresIn = parseInt(process.env.RESET_PASSWORD_EXPIRES)||60;//minutos
            const expirationDate = new Date(Date.now() + expiresIn * 60 * 1000);
            //guardar token en la base de datos
            await user.update({
                reset_password_token:resetToken,
                reset_password_expires:expirationDate,
            });

            //Enviar email
            await EmailService.sendPasswordChangedEmail(user, resetToken);

            return{
                succes: true,
                message: "Si el email existe recibiras un enlace de recuperacion."
            };

        }catch (error){
            console.error("Error en requestPasswordReset", error);
            throw error;
        }
    }

    /**
     * verificar token de recuperacion
     */
    async verifyResetToken(token){
        try {
            const user = await UserRepository.findByTokenPassword(token);

            if (!user) {
                throw new Error("Token invalido o expirado.");
            }

            //verificar si el token expiro
            const now = new Date();
            if (now > user.reset_password_expires) {
                //limpiar token expirado
                await user.update({
                    reset_password_token: null,
                    reset_password_expires: null,
                });
                throw new Error("Token expirado, solicita uno nuevo");
            }

            return {
                success: true,
                email: user.email,
                message: "Token valido"
            };
        } catch (error) {
            console.error("Error en verifyResetToken", error);
            throw error;
        }
    }

    /**
     * Restablecer contraseña
     */
    async resetPassword(token, newPassword){
        try{
            const user = await UserRepository.findByTokenPassword(token);

            if (!user) {
                throw new Error("token invalido o expirado");
            }

            const now = new Date();
            if (now > user.reset_password_expires) {
                //limpiar token expirado
                await user.update({
                    reset_password_token: null,
                    reset_password_expires: null,
                });
                throw new Error("Token expirado, solicita uno nuevo");
            }
            //encriptar nueva password
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.default.hash(newPassword, saltRounds);
            //actualizar contraseña y limpiar token
            await user.update({
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null,
            });
            //enviar email de confirmacion
            await EmailService.sendPasswordChangedEmail(user);

            return {
                success: true,
                message: "Contraseña actualiza con exito",
            };
        }   catch (error) {
            console.log("Error en resetPassword", error);
            throw error;
        }
    }
}

module.exports = new AuthService();