const { procesarExcel } = require("../services/excelReader");


async function uploadJuicios(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No se recibió ningún archivo" });
        }

        const rutaArchivo = req.file.path;
        const resumen = await procesarExcel(rutaArchivo);

        return res.json({
            msg: "Archivo procesado correctamente",
            resumen
        });
    } catch (error) {
        console.error("Error procesando Excel:", error);
        return res.status(500).json({ msg: "Error interno al procesar el archivo" });
    }
}

module.exports = {
    uploadJuicios
};
