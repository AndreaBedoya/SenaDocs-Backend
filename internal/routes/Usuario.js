const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UserController.js');
const verificarToken = require('../middlewares/VerificarTokenMiddleware.js');
const autorizarRoles = require('../middlewares/AutorizarRolesMiddleware.js');

// Actualizar usuario(Perfil/Admin)
router.put('/perfil/:id', verificarToken, autorizarRoles(['ADMIN']), usuarioController.actualizarUsuario);

module.exports = router;