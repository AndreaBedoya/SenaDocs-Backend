const { procesarExcel } = require("../services/excelReader");
const cache = new Map();

async function uploadJuicios(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No se recibió ningún archivo" });
        }

        const rutaArchivo = req.file.path;

        const data = await procesarExcel(rutaArchivo);

        const archivoId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        cache.set(archivoId, data);

        return res.json({
            msg: "Archivo procesado correctamente",
            archivoId: archivoId,
            resumen: data.resumenGlobal
        });
    } catch (error) {
        console.error("Error procesando Excel:", error);
        return res.status(500).json({ msg: "Error interno al procesar el archivo" });
    }
}

module.exports = {
    uploadJuicios,
    cache
};