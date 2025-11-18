const db= require("../models");
const {TRAZABILIDAD_SESIONES} = db;

class TrazabilidadRepository {
    /**
     * Registra inicio de nueva sesion.
     * @param {number} userId
     * @param {string} ipAddress
     * @param {string} dispositivo
     * @returns {object} registro de sesion creada.
     */
    async logLogin(userId, ipAddress,dispositivo){
        return TRAZABILIDAD_SESIONES.create({
            usuario_id: userId,
            fecha_inicio: new Date(),
            ipAddress: ipAddress,
            dispositivo: dispositivo,
        });
    }

    /**
     * Registra cierre de sesion
     * @param {number} sessionId
     */
    async logLogout(sessionId){
        return TRAZABILIDAD_SESIONES.update(
            { fecha_cierre: new Date() },
            { where: {id: sessionId, fecha_cierre: null } }
        );
    }
}

module.exports = new TrazabilidadRepository();