const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generarExcelSaberTyT(resumenGlobal, ficha, centroFormacion) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Saber TyT');
    const colorVerdeSena = '00B050';

    // Configuración de columnas
    worksheet.columns = [
        { header: 'Documento', key: 'documento', width: 20 },
        { header: 'Nombre del Aprendiz', key: 'nombre', width: 40 },
        { header: '% Avance', key: 'avance', width: 15 },
        { header: 'Estado en Convocatoria', key: 'estado', width: 25 },
        { header: 'Observaciones', key: 'obs', width: 35 }
    ];

    // Diseño de encabezado de tabla
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorVerdeSena } };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    });

    resumenGlobal.forEach(aprendiz => {
        const porcentajeNum = parseFloat(aprendiz.porcentajeJuiciosEvaluados.replace('%', ''));
        const esHabilitado = porcentajeNum >= 75;

        const row = worksheet.addRow({
            documento: aprendiz.documento,
            nombre: aprendiz.nombre,
            avance: aprendiz.porcentajeJuiciosEvaluados,
            estado: esHabilitado ? 'HABILITADO' : 'NO HABILITADO',
            obs: esHabilitado ? 'CUMPLE REQUISITO >= 75%' : 'NO CUMPLE MENOS DEL 75%'
        });

        row.getCell('estado').font = {
            bold: true,
            color: { argb: esHabilitado ? '008000' : 'FF0000' }
        };
    });

    const tempPath = path.join(__dirname, `../temp_saber_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(tempPath);
    return tempPath;
}

module.exports = { generarExcelSaberTyT };