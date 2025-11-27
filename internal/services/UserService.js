const userRepository = require('../repository/UserRepository.js');

const UserService = {
    /**
     * @description Lógica de negocio para actualizar un usuario (excluyendo password).
     * @param {number} userId - ID del usuario a actualizar.
     * @param {object} datosActualizar - Datos del usuario a actualizar.
     * @returns {Promise<Array>} Resultado de la actualización de Sequelize.
     */
    async actualizarUsuario(userId, datosActualizar) {

        if (datosActualizar.password) {
            delete datosActualizar.password;
        }

        const resultadoUpdate = await userRepository.update(userId, datosActualizar);

        return resultadoUpdate;
    },

    async obtenerUsuarioPorNombre(nombre) {
        if (!nombre) {
            throw new Error(`Tiene que llenar el campo de nombre.`);
        }
        return await userRepository.findByName(nombre);
    },

    async obtenerUsuarioPorCentroFormacion(centroFormacion) {
        if (!centroFormacion) {
            throw new Error(`Tiene que llenar el campo de centro de formación.`);
        }
        return await userRepository.findByCentroFormacion(centroFormacion);
    },

    async obtenerUsuarioPorEmail(email) {
        if (!email) {
            throw new Error(`Tiene que llenar el campo de e-mail.`);
        }
        return await userRepository.findByEmail(email);
    },

    async obtenerUsuarioPorId(id) {
        if (!id) {
            throw new Error(`Tiene que llenar el campo de id.`);
        }
        return await userRepository.findById(id);
    },

    async obtenerUsuarioPorDocumento(documento) {
        if (!documento) {
            throw new Error(`Tiene que llenar el campo de documento.`);
        }
        return await userRepository.findByDocument(documento);
    }
};

module.exports = UserService;