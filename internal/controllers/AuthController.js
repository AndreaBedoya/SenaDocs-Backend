const AuthService = require('../services/AuthService');
const { validationResult } = require('express-validator');

class AuthController {

    /**
     * POST /register
     * */
    async register(req, res) {
        try {
            //validar errores de express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validacion',
                    errors: errors.array()
                });
            }

            //Extraer datos del body
            const userData = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                password: req.body.password,
                documento_identidad: req.body.documento_identidad,
                telefono: req.body.telefono,
                role_id: req.body.role_id
            };

            const result = await AuthService.register(userData);

            //Respuesta exitosa
            return res.status(201).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Error en AuthController.register:',error);

            //Manejo de errores especificos
            if (error.message.includes('Ya esta registrado')){
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    }

    /**
     * POST /login
     */
    async login(req, res) {
        try {
            //Validar errores
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validacion',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            //llamar servicio
            const result = await AuthService.login(email, password);

            //Respuesta existosa
            return res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Error en AuthController.login:',error);

            if (error.message.includes('Credenciales invalidas') || error.message.includes('Usuario inactivo')){
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error al iniciar sesion',
                error: error.message
            });
        }
    }

    /**
     * GET /me
     * Obtener información del usuario autenticado
     * (Requiere authMiddleware)
     */
    async getProfile(req, res) {
        try {
            // req.user viene del authMiddleware
            const userId = req.user.id;

            const { USUARIOS, ROLES } = require('../../config/database.js').models;

            const user = await USUARIOS.findByPk(userId, {
                include: [{
                    model: ROLES,
                    as: 'role',
                    attributes: ['id', 'nombre', 'descripcion']
                }],
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
                message: 'Perfil obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error en AuthController.getProfile:', error);

            return res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }

}
module.exports = new AuthController();
