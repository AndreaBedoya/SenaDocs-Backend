
// IMPORTACIONES Y CONFIGURACION INICIAL

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { connectDB } = require("./config/Database");
const models = require("./internal/models");
const authRoutes = require("./internal/routes/AuthRoutes");
const {swaggerDocs} = require("./config/Swagger");

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES GLOBALES

app.use(cors());
app.use(express.json());

// MONTAJE DE RUTAS
const AuthRoutes = require("./internal/routes/AuthRoutes");
app.use("/api/auth", AuthRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API de SenaDocs funcionando. Visita /api/docs para la documentacion."
    });
});

// ARRANQUE DEL SERVIDOR

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(` Servidor backend corriendo en http://localhost:${PORT}`)
            swaggerDocs(app, PORT);
        });

    } catch (error) {
        console.error("El servidor no pudo iniciar.", error);
        process.exit(1);
    }
}

startServer();