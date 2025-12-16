const router = require("express").Router();
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const uploadFiles = require("../../config/MulterConfig");
const documentController = require("../controllers/DocumentController");

router.post(
    "/renombrar-descargar",
    authMiddleware,
    uploadFiles,
    documentController.renombrarDescargar
);

module.exports = router;