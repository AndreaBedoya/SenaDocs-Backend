const userService = require('../services/UserService.js');
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
            const resultadoUpdate = await userService.actualizarUsuario(userId, datosActualizar);

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
    },

    async obtenerUsuarioPorNombre(req, res) {
        try {
            if (!req.nombre) {
                throw new Error("campo de nombre vacio");
            }
            const resul = await userService.obtenerUsuarioPorNombre(req.nombre);
            return res.status(200).json({success: true, message: "Usuario encontrado", ...resul});
        } catch (error) {
            console.log("Error al en ObtenerUsuarioPorNombre controlador:", error);
            return res.status(500).json({message: "error de servidor"});
        }

    },

    async obtenerUsuarioPorCentroFormacion(req, res) {
        try {
            if (!req.centroFormacion) {
                throw new Error("campo de centro de formacion vacio");
            }
            const resul = await userService.obtenerUsuarioPorCentroFormacion()
            return res.status(200).json({success: true, message: "Usuario encontrado", ...resul});
        } catch (error) {
            console.error("Error en obtenerUsuarioPorCentroFormacion controlador:", error);
            return res.status(500).json({message: "error de servidor"});
        }
    },

    async obtenerUsuarioPorEmail(req, res) {
        try {
            if (!req.email) {
                throw new Error("campo de email vacio");
            }
            const resul = await userService.obtenerUsuarioPorEmail(req.email);
            return res.status(200).json({success: true, message: "Usuario encontrado", ...resul});
        } catch (error) {
            console.error("Error en obtenerUsuarioPorEmail controlador:", error);
            return res.status(500).json({message: "error de servidor"});
        }
    },

    async obtenerUsuarioPorId(req, res) {
        try {
            if (!req.params.id) {
                throw new Error("Campo de ID vacio");
            }
            const result = await userService.obtenerUsuarioPorId(req.params.id);
            return res.status(200).json({success: true, message: "usuario encontrado", ...result});

        } catch (error) {
            console.error("Error en buscarUsuarioPorId", error);
            return res.status(500).json({success: false, message: "error de servidor", error});
        }
    },

    async buscarUsuarioPorDocumento(req, res) {
        try {
            if (!req.documento) {
                throw new Error ("Campo de documento vacio");
            }
            const result = userService.obtenerUsuarioPorDocumento(req.documento);
            return res.status(200).json({ success: true, message: "Usuario encontrado", ...result });
        } catch (error) {
            console.error("error en obtenerUsuarioPorDocumento controlador", error);
            return res.status(500).json({ success: false, message: "Error de servidor", error});
        }
    } ,
};

module.exports = UsuarioController;