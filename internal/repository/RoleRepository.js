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

    /**
     * Obtiene el rol por id.
     * @param {number} id
     * @returns {object}
     */
    async findById(id){
        return ROLES.findByPk(id);
    }


    /**
     * Obtiene el rol por nombre.
     * @param {string} nombreRol
     * @returns {object}
     */
    async findByName(nombreRol){
        return ROLES.findOne({
            where: {nombre: nombreRol}
        })
    }
}

module.exports = new RoleRepository();