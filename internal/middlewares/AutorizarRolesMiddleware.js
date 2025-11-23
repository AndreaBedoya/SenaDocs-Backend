const db = require('../models');
const { ROLES } = db;

// Variable para almacenar el ID del rol ADMIN en caché
let ADMIN_ROL_ID_CACHE = null;

/**
 * Busca y cachea el ID del rol "ADMIN" en la base de datos.
 * @returns {Promise<number>} El ID del rol de administrador.
 */
const getAdminRoleId = async () => {
    if (ADMIN_ROL_ID_CACHE) {
        return ADMIN_ROL_ID_CACHE;
    }

    try {
        const adminRole = await ROLES.findOne({ where: { nombre: 'ADMIN' } });

        if (adminRole) {
            ADMIN_ROL_ID_CACHE = adminRole.id;
            return ADMIN_ROL_ID_CACHE;
        } else {
            // Advertencia si no se encuentra ningún rol de administrador
            console.error("ADVERTENCIA DE SEGURIDAD: No se encontró un rol de administrador válido ('ADMIN') en la base de datos.");
            return 1;
        }
    } catch (error) {
        console.error("Error al buscar el ID del rol de administrador:", error);
        return 1;
    }
}

const autorizarRoles = (rolesPermitidos) => {
    return async (req, res, next) => {
        // Obtener el ID del Admin (lo busca solo la primera vez, luego usa la caché)
        const ADMIN_ROL_ID = await getAdminRoleId();

        // req.usuario fue adjuntado por VerificarTokenMiddleware
        const usuarioAutenticadoId = req.usuario.id;
        const usuarioRutaId = parseInt(req.params.id);

        // El usuario es un Administrador
        // Compara el rol_id del usuario con el ID del rol ADMIN obtenido de la DB
        const esAdmin = req.usuario.rol_id === ADMIN_ROL_ID;

        // El usuario se está modificando a sí mismo (Gestionar perfil)
        const seEstaModificandoASiMismo = usuarioAutenticadoId === usuarioRutaId;

        // Verificar autorización:
        if (esAdmin || seEstaModificandoASiMismo) {
            next();
        } else {
            return res.status(403).json({
                message: "Acceso denegado. No tiene permisos para modificar este perfil."
            });
        }
    };
};

module.exports = autorizarRoles;