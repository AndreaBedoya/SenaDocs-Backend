import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// ====================
// Rutas internas
// ====================
import registroroutes from "./internal/routes/Registro.js";
import loginroutes from "./internal/routes/Login.js";
import Dashboardroutes from "./internal/routes/Dashboard.js";
import usuarioroutes from "./internal/routes/Usuario.js";
import perfilroutes from "./internal/routes/Perfil.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// ====================
// Middleware base
// ====================
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ====================
// Configuración Swagger
// ====================
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SenaDocs API",
            version: "1.0.0",
            description: "Documentación interactiva de la API de SenaDocs 🚀",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Servidor local",
            },
        ],
    },
    apis: ["./internal/routes/*.js"], // 🔥 ajusta según la ubicación de tus endpoints
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ====================
// Rutas API
// ====================
app.get("/", (req, res) => {
    res.send("🚀 Backend de SenaDocs funcionando correctamente");
});

app.use("/api", registroroutes);
app.use("/api", loginroutes);
app.use("/api", Dashboardroutes);
app.use("/api/perfil", perfilroutes);
app.use("/api/perfil", usuarioroutes);

// ====================
// Configuración Multer
// ====================
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = path.join(__dirname, "temp");
        fs.mkdirSync(tempPath, { recursive: true });
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: tempStorage });

app.post(
    "/api/upload",
    upload.fields([
        { name: "archivos", maxCount: 100 },
        { name: "carpeta" },
        { name: "ficha" },
    ]),
    (req, res) => {
        // Tu lógica de renombrado y organización de archivos
        res.json({ message: "Archivos subidos correctamente" });
    }
);

// ====================
// Servidor en marcha
// ====================
app.listen(PORT, () => {
    console.log(`🚀 Backend de SenaDocs corriendo en http://localhost:${PORT}`);
    console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
});
