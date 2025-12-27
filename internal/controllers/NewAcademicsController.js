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

        const { buffer, fileName, dataRows } = await generarExcelNovedades(rutaExcel);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        return res.json({
            resumen: dataRows,
            archivoBase64: buffer.toString('base64'),
            fileName: fileName
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


