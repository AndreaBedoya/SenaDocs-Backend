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

            const resul = await authService.login({
                documento,
                password
            });
            return res.status(200).json({ succes: true, message: "Inicio de sesion exitoso", ...resul });
        } catch (error) {
            const statusCode = error.message.includes("login") ? 409 : 500;
            return res.status(statusCode).json({
                succes: false,
                message: error.message || "Error al procesar login."
            });
        }

    }
}

module.exports = new AuthController();