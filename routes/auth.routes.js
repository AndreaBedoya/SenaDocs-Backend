const express = require('express');
const router = express.Router();
const AuthController = require('../internal/controllers/AuthController');
const { authMiddleware } = require('../internal/middlewares/authMiddleware');
const {
    registerValidation,
    loginValidation,
} = require('../internal/middlewares/validators/authValidators');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', registerValidation, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private (requiere token)
 */
router.get('/me', authMiddleware, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private (requiere token)
 */
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;