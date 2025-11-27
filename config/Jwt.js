require('dotenv').config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,

    expiresIn: process.env.JWT_EXPIRATION,

    algorithm: 'HS256',

    issuer: 'senadocs-api',

    audience: 'senadocs-client',
};

module.exports = jwtConfig;