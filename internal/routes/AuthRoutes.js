// Archivo: internal/routes/AuthRoutes.js

const express = require('express');
const router = express.Router();

// >>> IMPORTACIÓN CORREGIDA <<<
const authController = require('../controllers/AuthController');

// Importa los middlewares de tu compañero para proteger rutas
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// ==========================================
// Rutas de Autenticación
// ==========================================

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (usando el middleware de tu compañero)
router.get('/me', authMiddleware, authController.getProfile);

// Pendiente: Rutas de Recuperación (Forgot/Reset Password)

module.exports = router;