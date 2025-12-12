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
            const resultadoUpdate = await userService.actualizarUsuario(userId, datosActualizar);

            if (!Array.isArray(resultadoUpdate) || resultadoUpdate.length === 0) {
                return res.status(500).json({ message: "Error interno del servidor: Resultado de DB no es un array válido." });
            }

            const filasActualizadas = resultadoUpdate[0];
            const instanciasActualizadas = resultadoUpdate[1];

            let usuarioActualizado = null;

            if (filasActualizadas === 0) {
                return res.status(404).json({ message: "Usuario no encontrado o no se realizaron cambios." });
            }

            if (instanciasActualizadas && Array.isArray(instanciasActualizadas) && instanciasActualizadas.length > 0) {
                usuarioActualizado = instanciasActualizadas[0];
            } else {
                usuarioActualizado = await UserRepository.findById(userId);
            }

            const respuestaUsuario = usuarioActualizado ? usuarioActualizado.get({ plain: true }) : null;
            if (respuestaUsuario) {
                delete respuestaUsuario.password;
                delete respuestaUsuario.reset_password_token;
                delete respuestaUsuario.reset_password_expires;
            }

            return res.status(200).json({
                success: true,
                message: "Usuario actualizado exitosamente",
                usuario: respuestaUsuario,
            });

        } catch (error) {
            console.error("Error al actualizar usuario:", error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: "Error de datos: El email o documento ya está registrado.",
                    fields: error.errors.map(e => e.path)
                });
            }

            return res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el usuario." });
        }
    },

    async obtenerUsuarioPorNombre(req, res) {
        try {
            if (!req.params.nombre) {
                throw new Error("Campo de nombre vacío");
            }
            const resul = await userService.obtenerUsuarioPorNombre(req.params.nombre);
            return res.status(200).json({ success: true, message: "Usuario encontrado", usuario: resul });
        } catch (error) {
            console.error("Error en obtenerUsuarioPorNombre:", error);
            return res.status(500).json({ success: false, message: "Error de servidor" });
        }
    },

    async obtenerUsuarioPorCentroFormacion(req, res) {
        try {
            if (!req.params.centroFormacion) {
                throw new Error("Campo de centro de formación vacío");
            }
            const resul = await userService.obtenerUsuarioPorCentroFormacion(req.params.centroFormacion);
            return res.status(200).json({ success: true, message: "Usuario encontrado", usuario: resul });
        } catch (error) {
            console.error("Error en obtenerUsuarioPorCentroFormacion:", error);
            return res.status(500).json({ success: false, message: "Error de servidor" });
        }
    },

    async obtenerUsuarioPorEmail(req, res) {
        try {
            if (!req.params.email) {
                throw new Error("Campo de email vacío");
            }
            const resul = await userService.obtenerUsuarioPorEmail(req.params.email);
            return res.status(200).json({ success: true, message: "Usuario encontrado", usuario: resul });
        } catch (error) {
            console.error("Error en obtenerUsuarioPorEmail:", error);
            return res.status(500).json({ success: false, message: "Error de servidor" });
        }
    },

    async obtenerUsuarioPorId(req, res) {
        try {
            if (!req.params.id) {
                throw new Error("Campo de ID vacío");
            }
            const result = await userService.obtenerUsuarioPorId(req.params.id);
            return res.status(200).json({ success: true, message: "Usuario encontrado", usuario: result });
        } catch (error) {
            console.error("Error en obtenerUsuarioPorId:", error);
            return res.status(500).json({ success: false, message: "Error de servidor", error });
        }
    },

    async buscarUsuarioPorDocumento(req, res) {
        try {
            if (!req.params.documento) {
                throw new Error("Campo de documento vacío");
            }
            const result = await userService.obtenerUsuarioPorDocumento(req.params.documento);
            return res.status(200).json({ success: true, message: "Usuario encontrado", usuario: result });
        } catch (error) {
            console.error("Error en buscarUsuarioPorDocumento:", error);
            return res.status(500).json({ success: false, message: "Error de servidor", error });
        }
    },

    /**
     * @description Nuevo método: obtener el perfil del usuario autenticado usando el id del token
     */
    async obtenerMiPerfil(req, res) {
        try {
            const userId = req.usuario?.id; // viene del token
            if (!userId) {
            return res.status(400).json({ success: false, message: "Usuario no identificado." });
            }

            const user = await UserRepository.findById(userId);
            if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
            }

            const u = user.get({ plain: true });

            const perfil = {
            nombre_completo: `${u.nombre || ""} ${u.apellido || ""}`.trim(),
            correo: u.email || null,
            ciudad: u.ciudad || null,
            fecha_nacimiento: u.fecha_nacimiento || null,
            telefono: u.telefono || null,
            documento: u.documento || null,
            cargo: u.cargo || null,
            funciones: u.funciones_trabajo || null,
            foto: u.foto || null,
            centro_formacion: u.centro_formacion || null
            };

            return res.status(200).json({ success: true, usuario: perfil });
        } catch (error) {
            console.error("Error en obtenerMiPerfil:", error);
            return res.status(500).json({ success: false, message: "Error de servidor" });
        }
    }
};

module.exports = UsuarioController;
