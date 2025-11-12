import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener todos los archivos de rutas de forma explícita
const routesDir = path.join(__dirname, "./internal/routes");
const apiFiles = [];

if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    files.forEach(file => {
        if (file.endsWith(".js")) {
            apiFiles.push(path.join(routesDir, file));
        }
    });
} else {
    console.warn("No se encontró la carpeta de rutas:", routesDir);
}

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SenaDocs API",
            version: "1.0.0",
            description: "Documento de la API de SenaDocs",
        },
        servers: [
            {
                url: "http://localhost:4000/api",
                description: "Servidor local de desarrollo",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    // Usar array de archivos explícitos en lugar de glob pattern
    apis: apiFiles.length > 0 ? apiFiles : ["./internal/routes/*.js"],
};

let swaggerSpec;
try {
    swaggerSpec = swaggerJSDoc(options);
    console.log("Swagger cargado correctamente");
    console.log(`Archivos de rutas encontrados: ${apiFiles.length}`);
} catch (err) {
    console.error("Error generando Swagger spec:", err.message);
    console.error("Detalles:", err);
    swaggerSpec = null;
}

export { swaggerUi, swaggerSpec };

export const swaggerDocs = (app) => {
    if (swaggerSpec) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        console.log("Swagger UI montado en /api-docs");
    } else {
        console.warn("Swagger no se montó porque no se generó la especificación.");
    }
};

