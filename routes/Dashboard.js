import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verificarToken } from "../internal/middlewares/verificarToken.js";
import { organizarYRenombrarPDF } from "../internal/controllers/renombrarPDF.js";

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

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Subir y organizar archivos pdf
 *     description: Subir multiples archivos pdf, organizar dentro de carpetas y renombrar automaticamente
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []   # Token JWT requerido
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: archivos pdf para subir
 *               carpeta:
 *                 type: string
 *                 example: "CarpetaPrincipal"
 *               ficha:
 *                 type: string
 *                 example: "Ficha12345"
 *     responses:
 *       200:
 *         description: Archivos subidos y organizado exitosamente
 *       400:
 *         description: Archivos no encontrados o entrada invalida
 *       401:
 *         description: Inautorizado, no ha iniciado sesion
 *       500:
 *         description: Error de servidor mientras se subian los archivos
 */
// Ruta protegida para subir y renombrar archivos PDF
router.post("/upload", verificarToken, upload.fields([
  { name: "archivos", maxCount: 100 },
  { name: "carpeta" },
  { name: "ficha" }
]), organizarYRenombrarPDF);

export default router;
