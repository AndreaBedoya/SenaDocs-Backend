import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verificarToken } from "../../middlewares/verificarToken.js";
import { organizarYRenombrarPDF } from "../controllers/renombrarPDF.js";

const router = express.Router();

// Configuración de almacenamiento temporal
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join("temp");
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: tempStorage });

// Ruta protegida para subir y renombrar archivos PDF
router.post("/upload", verificarToken, upload.fields([
  { name: "archivos", maxCount: 100 },
  { name: "carpeta" },
  { name: "ficha" }
]), organizarYRenombrarPDF);

export default router;
