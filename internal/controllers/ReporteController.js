const path = require('path');
const fs = require('fs');
const { generarPDFDetalle, generarPDFElegibles } = require("../services/pdfGenerator");
const { generarExcelSaberTyT} = require("../services/ExcelGenerator")
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

    // Encontrar el aprendiz específico en la lista detallada
    const aprendiz = datosCargados.aprendicesDetalle.find(a => a.documento === documento);

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
    const { datosCargados } = req;

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

async function generarExcelElegibles(req, res) {
    const { datosCargados } = req;

    try {
        const rutaExcel = await generarExcelSaberTyT(
            datosCargados.resumenGlobal,
            datosCargados.ficha,
            datosCargados.centroFormacion
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Reporte_TyT_${datosCargados.ficha}.xlsx"`);

        const fileStream = fs.createReadStream(rutaExcel);
        fileStream.pipe(res);

        fileStream.on('close', () => {
            fs.unlink(rutaExcel, (err) => {
                if (err) console.error("Error al borrar temp excel:", err);
            });
        });

    } catch (error) {
        console.error("Error al generar Excel TyT:", error);
        res.status(500).json({ msg: "Error al generar el archivo Excel." });
    }
}

module.exports = {
    verificarCarga,
    generarReporteIndividual,
    generarReporteElegibles,
    generarExcelElegibles
};