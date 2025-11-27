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
                centro_formacion,
                ciudad,
                telefono,
                fecha_nacimiento,
                cargo,
                funciones_trabajo,
                rol_id
            } = req.body;

            if (!email || !password || !nombre || !documento || !centro_formacion || !rol_id || !apellido || !telefono || !ciudad || !cargo || !fecha_nacimiento || !funciones_trabajo) {
                return res.status(400).json({ success: false, message: "Faltan campos obligatorios."});
            }

            const result = await  authService.register({
                nombre,
                apellido,
                email,
                password,
                documento,
                centro_formacion,
                ciudad,
                telefono,
                fecha_nacimiento,
                cargo,
                funciones_trabajo,
                rol_id
            });

            return res.status(201).json({ success: true, message: "Registro exitoso", ...result });
        } catch (error) {
            const statusCode = error.message.includes("registrado") ? 409 : 500;
            return res.status(statusCode).json({
                success: false,
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
                return res.status(400).json({ success: false, message: "Faltan campos por llenar."})
            }

            const resul = await authService.login(
                documento,
                password
            );

            return res.status(200).json({ success: true, message: "Inicio de sesion exitoso", ...resul });
        } catch (error) {
            const statusCode = error.message.includes("login") ? 409 : 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || "Error al procesar login."
            });
        }

    }

    async forgotPassword(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Errores de validacion",
                    errors: errors.array()
                });
            }

            const { email } = req.body;

            const result = await authService.requestPasswordReset(email);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.forgotPassword", error);

            return res.status(500).json({
                success: false,
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
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.verifyResetToken", error);

            if (error.message.includes("Token")) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
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
                    success: false,
                    message: "Errores de validacion",
                    errors: errors.array()
                });
            }

            const { token, newPassword, confirmPassword } = req.body;
            const result = await authService.resetPassword(token, newPassword, confirmPassword);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error("Error en AuthController.resetPassword", error);
            if (error.message.includes("Token")) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Error al restablecer contraseña",
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();