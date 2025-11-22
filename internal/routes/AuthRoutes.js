const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authValidators = require('../middlewares/validators/AuthValidators');

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/forgot-password", authValidators.forgotPasswordValidation, authController.forgotPassword);

router.get("/reset-password/:token", authController.verifyResetToken);

router.post("/reset-password", authValidators.resetPasswordValidation, authController.resetPassword);

module.exports = router;