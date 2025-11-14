import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "../../config/swagger.js";
import { sequelize} from "../../config/database.js";
import './usuarios.js'

sequelize.sync()
    .then(() => console.log('Modelos sincronizados correctamente'))
    .catch((err) => console.log('Error al sincronizar modelos',err));


// ====================
// Rutas internas
// ====================
import registroroutes from "../../routes/Registro.js";
import loginroutes from "../../routes/Login.js";
import Dashboardroutes from "../../routes/Dashboard.js";
import usuarioroutes from "../../routes/Usuario.js";
import perfilroutes from "../../routes/Perfil.js";

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
