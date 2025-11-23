// IMPORTACIONES Y CONFIGURACION INICIAL

const express = require("express");
const app = express();
const YAML = require("yamljs");
const {verifyEmailConnection} = require("./internal/utils/EmailUtils");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const dotenv = require("dotenv");
const usuarioRoutes = require("./internal/routes/Usuario.js");

dotenv.config();

const PORT = process.env.PORT || 4000;

const swaggerDocument = YAML.load("./swagger.yaml");
const { connectDB } = require("./config/Database");
const authRoutes = require("./internal/routes/AuthRoutes");

// CORS CONFIG
app.use(cors({
    origin: "http://localhost:5173",   // Permitir el front
    credentials: true,                 // Si envías tokens/cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middlewares
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Ruta base
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API de SenaDocs funcionando. Visita /api-docs para la documentacion."
    });
});

// ARRANQUE DEL SERVIDOR
async function startServer() {
    try {
        await connectDB();
        console.log("Verificando configuracion de email...")
        await verifyEmailConnection();
        app.listen(PORT, () => {
            console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
            console.log(`Documentacion de swagger disponible en http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("El servidor no pudo iniciar.", error);
        process.exit(1);
    }
};

startServer();
