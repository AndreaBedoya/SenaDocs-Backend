const router = require("express").Router();
const { verifyToken } = require("../utils/JwtUtils");
const uploadFiles = require("../../config/MulterConfig");
const documentController = require("../controllers/DocumentController");

router.post(
    "/renombrar-descargar",
    verifyToken,
    uploadFiles,
    documentController.renombrarDescargar
);

module.exports = router;