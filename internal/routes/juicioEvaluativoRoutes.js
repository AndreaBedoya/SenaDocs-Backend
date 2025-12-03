const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadJuicios } = require("../controllers/juicioEvaluativoController");
const fs = require("fs");

const router = express.Router();


const uploadDir = path.join(__dirname, "..", "uploads");

// Si la carpeta no existe, crearla automáticamente
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // ← usar la ruta absoluta
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post("/upload-juicios", upload.single("archivo"), uploadJuicios);

module.exports = router;
