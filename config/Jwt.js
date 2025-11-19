require('dotenv').config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,

    expiresIn: process.env.JWT_EXPIRES,

    algorithm: 'HS256',

    issuer: 'senadocs-api',

    audience: 'senadocs-client',
};

module.exports = jwtConfig;