const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SenaDocs API',
            version: '1.0.0',
            description: 'Documentación de la API de SenaDocs.',
        },
        servers: [
            {
                url: 'http://localhost:4000/api', // Ajusta el puerto si es necesario
            },
        ],
        // Definiciones de seguridad (para el JWT que ya implementamos)
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
    },
    // Rutas a la documentación de los endpoints (debe apuntar a tus archivos de rutas)
    apis: ["./internal/routes/*.js", "./internal/routes/*/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Función para configurar la documentación de Swagger en la aplicación Express.
 * @param {Express.Application} app - Instancia de Express.
 * @param {number} port - Puerto de la aplicación.
 */
const swaggerDocs = (app, port) => {
    // Ruta para la interfaz de usuario de Swagger
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    console.log(`📘 Docs disponibles en http://localhost:${port}/api/docs`);
};

module.exports = {
    swaggerDocs,
};