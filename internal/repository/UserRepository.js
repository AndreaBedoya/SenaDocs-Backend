const db = require("../models");
const { USUARIOS, ROLES } = db;

class UserRepository {

    /**
     * Crea un nuevo usuario.
     * @param {object} userData - Datos del usuario a crear.
     * @returns {object} El objeto usuario creado.
     */
    async create(userData) {
        return USUARIOS.create(userData);
    }

    /**
     * Busca un usuario por email.
     * @param {object} email
     * @returns {object}
     */
    async findByEmail(email) {
        return USUARIOS.findOne({
            where: { email: email },
            include: [{ model: ROLES, as: "rol" }],
        });
    }

    /**
     * Busca un usuario por id.
     * @param {number} id
     * @returns {object}
     */
    async findById(id){
        return USUARIOS.findByPk(id);
    }

    /**
     * Actualiza contraseña.
     * @param {object} userId
     * @returns {string} newHashedPassword
     */
    async updatePassword(userId,newHashedPassword) {
        return USUARIOS.update(
            { password: newHashedPassword },
            { where: { id: userId } }
        );
    }

    /**
     * Busca por identificacion.
     * @param {number} identificacion
     */
    async findByDocument(identificacion){
        return USUARIOS.findOne({
            where: { documento: identificacion },
        });
    }

    /**
     * Busca por token de recuperacion de password generado;
     * @param {string} token de recuperacion
     * @returns {object} usuario
     */
    async findByTokenPassword(token) {
        return USUARIOS.findOne({
            where: { reset_password_token: token },
        });
    }
}

module.exports = new UserRepository();