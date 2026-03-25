const fs = require("fs");
const { generarExcelNovedades } = require("../services/NewAcademicsService");

/**
 * Genera un Excel de Novedades Académicas con porcentajes y gráfica,
 * a partir de un archivo Excel subido por el usuario.
 */
async function generarReporteNovedades(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No se recibió ningún archivo Excel." });
        }

        const rutaExcel = req.file.path;

        const { buffer, fileName, resumen } = await generarExcelNovedades(rutaExcel);

        return res.status(200).json({
            resumen,
            archivoBase64: Buffer.from(buffer).toString("base64"),
            fileName,
        });
    } catch (error) {
        console.error("Error al generar Excel de novedades académicas:", error);
        return res.status(500).json({ msg: "Error al generar el Excel de novedades académicas." });
    } finally {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }
    }
}

module.exports = {
    generarReporteNovedades,
};


