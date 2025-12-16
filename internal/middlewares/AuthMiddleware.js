const { verifyToken, extractTokenFromHeader } = require('../utils/JwtUtils.js')
const db = require('../models');
const { USUARIOS } = db;

const authMiddleware = async (req, res, next) => {
    try {
        //Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, access denied.',
            });
        }

        //verificar token
        const decoded = verifyToken(token);

        //Obtener usuario de la base de datos con su rol incluido
        const user = await USUARIOS.findByPk(decoded.id, {
            include: [{
                model: db.ROLES,
                as: 'rol',
                required: false
            }]
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado.',
            });
        }

        //Agregar usuario al objeto request
        req.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            role: user.rol ? user.rol.nombre : null,
            role_id: user.rol_id,
        };

        //continuar con la siguiente funcion
        next();
    } catch (error) {
        console.log('Error en authMiddleware', error.message);

        if (error.message === 'Token expirado' || error.message === 'Token invalido') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado.',
                code: 'TOKEN_INVALID'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'No autorizado',
            error: error.message
        });
    }
};

/**
 * Verificar roles especificos
 * @param {Array}
 * */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            //verificar que el usuario este autenticado
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado, access denied.',
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(401).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta accion',
                    requiredRoles: allowedRoles,
                    currentRoles: req.user.role
                });
            }

            next();
        } catch (error) {
            console.log('Error en authorize middleware', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
            });
        }
    };
};

/**
 * Middleware para verificar que el usuario es propietario del recurso o es ADMIN
 * @param {String}
 */
const isOwnerOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        try {
            const resourceUserId = parseInt(req.params[paramName]);
            const currentUserId = req.user.id;
            const isAdmin = req.user.role === 'ADMIN';

            //Admin con todos los permisos
            if (isAdmin) {
                return next();
            }

            //El usuario solo puede acceder a sus propios recursos
            if (resourceUserId === currentUserId) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso',
            });
        } catch (error) {
            console.log('Error en isOwnerOrAdmin middleware', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
            });
        }
    };
};

module.exports = {
    authMiddleware,
    authorize,
    isOwnerOrAdmin
}