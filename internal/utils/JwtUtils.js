const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const jwtConfig = require('../../config/Jwt.js')

/**
 GENERAR TOKEN
 * @param {object} payload
 * @returns {String} - token
 */
const generateToken = (payload, expiresIn = jwtConfig.expiresIn) => {
    try {
        const token = jwt.sign(
            payload,
            jwtConfig.secret,
            {
                expiresIn,
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience,
                algorithm: jwtConfig.algorithm,
            }
        );
        return token;
    } catch (error) {
        console.log('Error generanmdo token:',error);
        throw new Error('Error al generar el token de autenticacion');
    }
};


/**
 VERIFICAR Y DECODIFICAR TOKEN
 * @param {String}
 * @returns {Object}
 * @throws {Error}
 */

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            jwtConfig.secret,
            {
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience,
                algorithm: jwtConfig.algorithm,
            }
        );
        console.log("ijasfnjkosaengjoksnrklhgnjrdklhjoiewjflkmsdlg", decoded)
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        }
        if (error.name === 'JsonWebTokenError'){
            throw new Error('Token invalido');
        }
        throw new Error('Error al verificar token');
    }
};

/**
 * Extrear token del header Authorization
 * @param {String}
 * @returns {String|null}
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    //validar formato "Bearer token"
    const parts = authHeader.split(' ');

    if (parts.length > 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};

module.exports = {
    generateToken,
    verifyToken,
    extractTokenFromHeader,
}
