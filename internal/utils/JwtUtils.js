const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRATION = process.env.JWT_EXPIRATION || "2h";

/**
 * token JWT
 * @param {object} payload - info usuario.
 * @returns {string} El token JWT.
 */
function generateToken(payload) {
    if (!SECRET) {
        throw new Error("JWT secret no esta definido");
    }

    return jwt.sign(payload, SECRET, { expiresIn: EXPIRATION });
}

module.exports = {
    generateToken,
};