const { body } = require('express-validator');
/**
 * Validacion para solicitar recuperacion de contraseña
 */
const forgotPasswordValidation = [
    body("email")
        .notEmpty().withMessage("El email es requerido")
        .isEmail().withMessage("El email no es valido")
        .trim()
];

/**
 * Validacion para restablecer contraseña
 */
const resetPasswordValidation = [
    body("token")
        .notEmpty().withMessage("Token requerido")
        .isString().withMessage("El token debe ser una cadena de texto")
        .isLength({ min: 32, max: 255 }).withMessage("Token invalido"),

    body("password")
        .notEmpty().withMessage("La nueva contraseña es requerida")
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("La contraseña debe tener al menos una mayuscula, una minuscula y un numero"),

    body("confirmPassword")
        .notEmpty().withMessage("Debes confirmar la contraseña")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Las contraseñas no coinciden");
            }
            return true;
        })
];

module.exports = {
    forgotPasswordValidation,
    resetPasswordValidation,
}