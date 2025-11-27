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
     * @param {object} nombre
     * @returns {object}
     */
    async findByName(nombre) {
        return USUARIOS.findOne({
            where: {nombre: nombre}
        });
    }

    /**
     * @param {object} centroFormacion
     * @returns {object}
     */
    async findByCentroFormacion(centroFormacion) {
        return USUARIOS.findOne({
            where: {centro_formacion: centroFormacion}
        });
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
     * Busca por identificacion.
     * @param {number} documento
     */
    async findByDocument(documento){
        return USUARIOS.findOne({
            where: { documento: documento },
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
     * @description Actualiza un usuario en la base de datos por su ID.
     * @param {number} id - ID del usuario a actualizar.
     * @param {object} datos - Objeto con los campos a actualizar.
     * @returns {Promise<[number, Array<Usuarios>]>} [número de filas afectadas, array de instancias actualizadas]
     */
    async update(id, datos) {
        const result = await USUARIOS.update(datos, {
            where: { id: id },
            returning: true,
        });

        return result;
    }
}

module.exports = new UserRepository();