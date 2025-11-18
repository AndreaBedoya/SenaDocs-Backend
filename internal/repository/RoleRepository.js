const db = require("../models");
const {ROLES} = db;

class RoleRepository {
    /**
     * Busca rol por nombre.
     * @param {string} roleName
     * @returns {object}
     */
    async findByRoleName(roleName){
        return ROLES.findOne({
            where: {nombre: roleName}
        });
    }

    /**
     * Obtiene todos los roles disponibles.
     */
    async findAll(){
        return ROLES.findAll();
    }
}

module.exports = new RoleRepository();