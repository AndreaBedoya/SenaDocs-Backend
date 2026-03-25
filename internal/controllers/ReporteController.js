const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const { generarPDFDetalle, generarPDFElegibles } = require("../services/PdfGenerator");
// Importar la caché del controlador de subida
const { cache } = require("./JuicioEvaluativoController");

// Middleware para verificar la caché
function verificarCarga(req, res, next) {
    const { archivoId } = req.params;
    const datosCargados = cache.get(archivoId);

    if (!datosCargados) {
        return res.status(404).json({ msg: "ID de archivo no encontrado o sesión expirada. Vuelva a cargar el Excel." });
    }
    req.datosCargados = datosCargados; // Adjuntar los datos al objeto request
    next();
}

// GENERACIÓN DEL REPORTE INDIVIDUAL
async function generarReporteIndividual(req, res) {
    const { documento } = req.params;
    const { datosCargados } = req;
    const aprendicesDetalle = datosCargados.aprendicesDetalle || [];

    if (aprendicesDetalle.length === 0) {
        return res.status(400).json({ msg: "No hay detalle de juicios disponible para generar reporte individual." });
    }

    // Encontrar el aprendiz específico en la lista detallada
    const aprendiz = aprendicesDetalle.find(a => a.documento === documento);

    if (!aprendiz) {
        return res.status(404).json({ msg: "Aprendiz no encontrado en este documento." });
    }

    try {
        // Generar el PDF
        const rutaPDF = await generarPDFDetalle(aprendiz, datosCargados.ficha);

        // Devolver el archivo PDF (descargar el archivo en el navegador)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Reporte_Individual_${documento}.pdf"`);

        const fileStream = fs.createReadStream(rutaPDF);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Error al generar reporte individual:", error);
        res.status(500).json({ msg: "Error al generar el PDF del reporte individual." });
    }
}

// GENERACIÓN DEL REPORTE POR FICHA (ELEGIBLES TYT)
async function generarReporteElegibles(req, res) {
    const { datosCargados } = req; // Obtenido de verificarCarga

    // Aplicar la lógica de negocio (filtro de 75%)
    const elegibles = datosCargados.resumenGlobal.filter(aprendiz => {
        const porcentajeStr = aprendiz.porcentajeJuiciosEvaluados.replace('%', '');
        return parseFloat(porcentajeStr) >= 75;
    });

    try {
        // Generar el PDF con la lista filtrada
        const rutaPDF = await generarPDFElegibles(elegibles, datosCargados.ficha);

        // Devolver el archivo PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Reporte_Elegibles_${datosCargados.ficha}.pdf"`);

        const fileStream = fs.createReadStream(rutaPDF);
        fileStream.pipe(res);

        //Eliminar el archivo después de enviarlo
        fileStream.on('close', () => { fs.unlink(rutaPDF, () => {}); });

    } catch (error) {
        console.error("Error al generar reporte elegibles:", error);
        res.status(500).json({ msg: "Error al generar el PDF del reporte de elegibles." });
    }
}

// GENERACION DEL REPORTE EXCEL RESUMEN TYT
async function generarReporteExcelTyt(req, res) {
    const { archivoId } = req.params;
    const { datosCargados } = req;

    try {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(datosCargados.resumenGlobal || []);
        xlsx.utils.book_append_sheet(workbook, worksheet, "ResumenTYT");

        const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
        const fileName = `Reporte_Juicios_${archivoId}.xlsx`;

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.send(excelBuffer);
    } catch (error) {
        console.error("Error al generar reporte Excel TYT:", error);
        return res.status(500).json({ msg: "Error al generar el Excel de juicios evaluativos." });
    }
}

module.exports = {
    verificarCarga,
    generarReporteIndividual,
    generarReporteElegibles,
    generarReporteExcelTyt,
};