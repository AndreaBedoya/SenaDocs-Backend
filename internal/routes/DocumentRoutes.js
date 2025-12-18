const router = require("express").Router();
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const uploadFiles = require("../../config/MulterConfig");
const documentController = require("../controllers/DocumentController");

router.post(
    "/renombrar-guardar-escritorio",
    authMiddleware,
    uploadFiles,
    documentController.renombrarGuardarEnEscritorio
);

module.exports = router;