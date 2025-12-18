const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generarReporteNovedades } = require("../controllers/NewAcademicsController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.post("/reporte", upload.single("archivo"), generarReporteNovedades);

module.exports = router;


