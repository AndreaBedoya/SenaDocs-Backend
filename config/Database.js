// Archivo: config/Database.js

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const initRoles = require('../internal/init/initRoles.js');

dotenv.config();

// Usamos las variables estándar de Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "postgres",
        logging: console.log, // Recomendable desactivar logs en entornos de prueba
        host: process.env.DB_HOST,
        port: process.env.DB_PORT // Asegúrate de incluir el puerto
    }
);

// Función de conexión que usamos en el archivo principal (App.js)
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Conexión a PostgreSQL establecida.');

        // Sincroniza los modelos. USAMOS force: false para no borrar los modelos en cada arranque.
        // Los modelos deben cargarse en el Index.js ANTES de este paso.
        await sequelize.sync({ force: true });
        console.log('Modelos de BD sincronizados. Tablas creadas.');
        await initRoles(sequelize);
        console.log('Roles de BD sincronizados xD.');
    } catch (error) {
        console.error('Error al conectar o sincronizar la BD:', error.message);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    connectDB
};