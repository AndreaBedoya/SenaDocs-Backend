import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Rutas
import registroRoutes from "./Routes/Registro.js";
import loginRoutes from "./Routes/Login.js";
import vistaPrincipalRoutes from "./Routes/VistaPrincipal.js";
import usuarioRoutes from "./Routes/Usuario.js"; // Ruta para actualizar perfil
import perfilRoutes from "./Routes/Perfil.js"; // Nueva ruta para obtener perfil

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Backend de SenaDocs funcionando correctamente");
});

app.use("/api", registroRoutes);
app.use("/api", loginRoutes);
app.use("/api", vistaPrincipalRoutes);
app.use("/api/perfil", perfilRoutes); // ✅ Ruta para obtener perfil
app.use("/api/perfil", usuarioRoutes); // ✅ Ruta para actualizar perfil

// Configuración de multer
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, "temp");
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: tempStorage });

app.post("/api/upload", upload.fields([
  { name: "archivos", maxCount: 100 },
  { name: "carpeta" },
  { name: "ficha" }
]), (req, res) => {
  // Tu lógica de renombrado y organización de archivos
});

app.listen(PORT, () => {
  console.log(`🚀 Backend de SenaDocs corriendo en http://localhost:${PORT}`);
});
