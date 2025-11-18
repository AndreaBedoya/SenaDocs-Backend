import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "../../config/swagger.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./config/swagger.js"; // Ajusta la ruta
import { sequelize, connectDB } from "./config/database.js"; // Importa connectDB
import db from "./internal/models/index.js"; // IMPORTA TUS MODELOS/ASOCIACIONES

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ... Middleware y Rutas (como estaban en el código de tu compañero) ...

// ====================
// INICIO DE LA APLICACIÓN
// ====================
// 1. Conectar a la BD y Sincronizar Modelos
connectDB(); // Esto ejecuta sequelize.authenticate() y sequelize.sync()

// 2. Iniciar el Servidor HTTP
app.listen(PORT, () => {
    console.log(`🚀 Backend de SenaDocs corriendo en http://localhost:${PORT}`);
    swaggerDocs(app, PORT);
});

// ====================
// Rutas internas
// ====================
import registroroutes from "../../routes/Registro.js";
import loginroutes from "../../routes/Login.js";
import Dashboardroutes from "../../routes/Dashboard.js";
import usuarioroutes from "../../routes/Usuario.js";
import perfilroutes from "../../routes/Perfil.js";

//
//const router = require("express").Router();
//const swaggerUi = require("swagger-ui-express");
//const swaggerDocument = require("./swagger.json");

//router.use ("/api - docs" , swaggerUi.serve); router.get ("/api - docs" , swaggerUi.setup(swaggerDocument));
//

dotenv.config();

const app = express();
const PORT = 4000;

// ====================
// Middleware base
// ====================
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

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
// Swagger Documentation
// ====================
swaggerDocs(app);

// ====================
// Servidor en marcha
// ====================
app.listen(PORT, () => {
    console.log(`🚀 Backend de SenaDocs corriendo en http://localhost:${PORT}`);
    console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
});



