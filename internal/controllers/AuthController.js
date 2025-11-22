const authService = require('../services/AuthService');
const {validationResult} = require("express-validator");

class AuthController {
    async register(req, res) {
        try {
            const {
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
            } = req.body;

            if (!email || !password || !nombre || !documento || !rol_id || !apellido || !telefono || !ciudad || !cargo || !contacto_emergencia || !nombre_contacto || !fecha_nacimiento || !tipo_sangre || !funciones_trabajo) {
                return res.status(400).json({ succes: false, message: "Faltan campos obligatorios."});
            }

            const result = await  authService.register({
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
            });

            return res.status(201).json({ succes: true, message: "Registro exitoso", ...result });
        } catch (error) {
            const statusCode = error.message.includes("registrado") ? 409 : 500;
            return res.status(statusCode).json({
                succes: false,
                message: error.message || "Error al procesar el registro."
            });
        }
    }

    async login(req, res) {
        try {
            const {
                documento,
                password
            } = req.body;
            if (!documento || !password) {
                return res.status(400).json({ succes: false, message: "Faltan campos por llenar."})
            }

            const resul = await authService.login(
                documento,
                password
            );

            return res.status(200).json({ succes: true, message: "Inicio de sesion exitoso", ...resul });
        } catch (error) {
            const statusCode = error.message.includes("login") ? 409 : 500;
            return res.status(statusCode).json({
                succes: false,
                message: error.message || "Error al procesar login."
            });
        }

    }

    async forgotPassword(req, res) {
        try {
            const errors = validationResult
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    succes: false,
                    message: "Errores de validacion",
                    errors: errors.array()
                });
            }

            const { email } = req.body;

            const result = await authService.requestPasswordReset(email);

            return res.status(200).json({
                succes: true,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.forgotPassword", error);

            return res.status(500).json({
                succes: false,
                message: "Error al procesar la solicitud",
                error: error.message
            });
        }
    }

    /**
     * Verificar si el token es valido
     */
    async verifyResetToken(req, res) {
        try {
            const { token } = req.params;
            const result = await authService.verifyResetToken(token);
            return res.status(200).json({
                succes: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.verifyResetToken", error);

            if (error.message.includes("Token")) {
                return res.status(400).json({
                    succes: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                succes: false,
                message: "Error al verificar el token",
                error: error.message
            });
        }
    }

    /**
     * Restablecer contraseña;
     */
    async resetPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    succes: false,
                    message: "Errores de validacion",
                    errors: errors.array()
                });
            }

            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            return res.status(200).json({
                succes: false,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.resetPassword", error);
            if (error.message.includes("Token")) {
                return res.status(400).json({
                    succes: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                succes: false,
                message: "Error al restablecer contraseña",
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();