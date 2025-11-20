const authService = require('../services/AuthService');

class AuthController {
    async register(req, res) {
        try {
            const {
                nombre,
                apellido,
                email,
                password,
                documento,
                telefono,
                contacto_emergencia,
                nombre_contacto,
                tipo_sangre,
                fecha_nacimiento,
                funciones_trabajo,
                rol_id
            } = req.body;

            if (!email || !password || !nombre || !documento || !rol_id || !apellido || !telefono || !contacto_emergencia || !nombre_contacto || !fecha_nacimiento || !tipo_sangre || !funciones_trabajo) {
                return res.status(400).json({ succes: false, message: "Faltan campos obligatorios."});
            }

            const result = await  authService.register({
                nombre,
                apellido,
                email,
                password,
                documento,
                telefono,
                contacto_emergencia,
                nombre_contacto,
                tipo_sangre,
                fecha_nacimiento,
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
}

module.exports = new AuthController();