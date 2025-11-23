const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { forgotPasswordValidation, resetPasswordValidation } = require('../middlewares/validators/AuthValidators');
const { validationResult } = require('express-validator');

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post(
    "/forgot-password",
    forgotPasswordValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    authController.forgotPassword
);

router.get("/reset-password/:token", authController.verifyResetToken);

router.post(
    "/reset-password",
    resetPasswordValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    },
    authController.resetPassword
);

module.exports = router;