const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController.js');
const verificarToken = require('../middlewares/VerificarTokenMiddleware.js');
const autorizarRoles = require('../middlewares/AutorizarRolesMiddleware.js');

// Actualizar usuario(Perfil/Admin)
router.put('/perfil/:id', verificarToken, autorizarRoles(['ADMIN']), userController.actualizarUsuario);

router.get("/user/:nombre", userController.obtenerUsuarioPorNombre);

router.get("/me/:id", verificarToken, userController.obtenerUsuarioPorId);

router.get("/perfil", verificarToken, userController.obtenerMiPerfil);

router.put('/perfil/documento/:documento', userController.actualizarUsuarioPorDocumento);

module.exports = router;