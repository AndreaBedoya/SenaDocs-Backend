const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadJuicios } = require("../controllers/JuicioEvaluativoController");
const {
    verificarCarga,
    generarReporteIndividual,
    generarReporteElegibles,
    generarExcelElegibles
} = require("../controllers/reporteController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

// Si la carpeta no existe, crearla automáticamente
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post("/upload-juicios", upload.single("archivo"), uploadJuicios);

router.get(
    "/reporte/individual/:archivoId/:documento",
    verificarCarga,
    generarReporteIndividual
);

router.get(
    "/reporte/elegibles/:archivoId",
    verificarCarga,
    generarReporteElegibles
);

router.get(
    "/reporte/excel-tyt/:archivoId",
    verificarCarga,
    generarExcelElegibles
);

module.exports = router;