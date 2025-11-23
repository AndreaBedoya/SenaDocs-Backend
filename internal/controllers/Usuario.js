const UsuarioService = require('../services/UsuarioService.js');
// Se agrega la importación del repositorio para el fallback (findById)
const UserRepository = require('../repository/UserRepository.js');

const UsuarioController = {
    /**
     * @description Controlador para actualizar la información de un usuario.
     */
    async actualizarUsuario(req, res) {
        const userId = req.params.id;
        const datosActualizar = req.body || {}; // Aseguramos que sea un objeto
        console.log(datosActualizar);

        try {
            //Llamar al Servicio y almacenar el resultado completo
            const resultadoUpdate = await UsuarioService.actualizarUsuario(userId, datosActualizar);

            // Verificación para manejar el TypeError: undefined is not iterable
            if (!Array.isArray(resultadoUpdate) || resultadoUpdate.length === 0) {
                return res.status(500).json({ message: "Error interno del servidor: Resultado de DB no es un array válido." });
            }

            // Desestructuración segura de los elementos principales
            const filasActualizadas = resultadoUpdate[0];
            const instanciasActualizadas = resultadoUpdate[1]; // Puede ser undefined o array vacío

            let usuarioActualizado = null;

            //Verificar si hubo filas actualizadas
            if (filasActualizadas === 0) {
                return res.status(404).json({ message: "Usuario no encontrado o no se realizaron cambios." });
            }

            //Lógica para obtener la instancia actualizada
            if (instanciasActualizadas && Array.isArray(instanciasActualizadas) && instanciasActualizadas.length > 0) {
                usuarioActualizado = instanciasActualizadas[0];
            } else {
                // Realizamos una consulta findById para obtener el objeto actualizado
                usuarioActualizado = await UserRepository.findById(userId);
            }

            //Preparar la respuesta final
            const respuestaUsuario = usuarioActualizado ? usuarioActualizado.get({ plain: true }) : null;
            if (respuestaUsuario) {
                // Eliminamos campos sensibles
                delete respuestaUsuario.password;
                delete respuestaUsuario.reset_password_token;
                delete respuestaUsuario.reset_password_expires;
            }

            return res.status(200).json({
                message: "Usuario actualizado exitosamente",
                usuario: respuestaUsuario,
            });

        } catch (error) {
            console.error("Error al actualizar usuario:", error);

            // Manejo de errores de Sequelize
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    message: "Error de datos: El email o documento ya está registrado.",
                    fields: error.errors.map(e => e.path)
                });
            }

            return res.status(500).json({ message: "Error interno del servidor al actualizar el usuario." });
        }
    }
};

module.exports = UsuarioController;