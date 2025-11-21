
// IMPORTACIONES Y CONFIGURACION INICIAL

const express = require("express");
const app = express();
const YAML = require("yamljs")
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4000;

const swaggerDocument = YAML.load("./swagger.yaml");
const { connectDB } = require("./config/Database");
const AuthRoutes = require("./internal/routes/AuthRoutes");

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
            console.log(` Servidor backend corriendo en http://localhost:${PORT}`);
            console.log(` Documentacion de swagger disponible en http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("El servidor no pudo iniciar.", error);
        process.exit(1);
    }
}

startServer();