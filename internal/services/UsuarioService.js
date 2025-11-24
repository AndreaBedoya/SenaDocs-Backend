const UserRepository = require('../repository/UserRepository.js');

const UsuarioService = {
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

        const resultadoUpdate = await UserRepository.update(userId, datosActualizar);

        return resultadoUpdate;
    },
};

module.exports = UsuarioService;