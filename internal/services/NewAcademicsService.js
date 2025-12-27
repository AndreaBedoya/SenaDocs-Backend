const readExcelFile = require("read-excel-file/node");
const ExcelJS = require("exceljs");
const QuickChart = require("quickchart-js");

// Tamaño para la imagen de la gráfica
const chartWidth = 800;
const chartHeight = 400;

/**
 * Lee el Excel de novedades académicas (solo columnas: Novedad Académica, Cantidad),
 * calcula el porcentaje por cada fila y genera un nuevo Excel con:
 *  - Columna extra "Porcentaje"
 *  - Hoja formateada
 *  - Gráfico de pastel incrustado como imagen
 *
 * @param {string} rutaExcel - Ruta del archivo Excel subido por el usuario.
 * @returns {Promise<{ buffer: Buffer, fileName: string }>} - Buffer del nuevo Excel y nombre sugerido.
 */
async function generarExcelNovedades(rutaExcel) {
    // Leer todas las filas del Excel original
    const rows = await readExcelFile(rutaExcel);

    if (!rows || rows.length === 0) {
        throw new Error("El archivo de novedades está vacío.");
    }

    // Buscar la fila de encabezados: debe contener "Novedad" y "Cantidad"
    let headerRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
        const col1 = (rows[i][0] || "").toString().toLowerCase();
        const col2 = (rows[i][1] || "").toString().toLowerCase();

        if (col1.includes("novedad") && col2.includes("cantidad")) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error('No se encontró una fila de encabezados con "Novedad" y "Cantidad" en las dos primeras columnas.');
    }

    // Extraer filas de datos a partir de la fila siguiente al encabezado
    const dataRows = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const novedad = row[0];
        const cantidadRaw = row[1];

        // Si ambas columnas vienen vacías, asumimos fin de tabla
        if ((novedad === null || novedad === undefined || novedad === "") &&
            (cantidadRaw === null || cantidadRaw === undefined || cantidadRaw === "")) {
            break;
        }

        if (novedad === null || novedad === undefined || novedad === "") {
            continue;
        }

        const cantidad = Number(cantidadRaw);
        if (Number.isNaN(cantidad)) {
            continue;
        }

        dataRows.push({
            novedad: novedad.toString(),
            cantidad
        });
    }

    if (dataRows.length === 0) {
        throw new Error("No se encontraron filas de datos válidas (Novedad Académica y Cantidad).");
    }

    // Calcular total y porcentajes
    const total = dataRows.reduce((acc, item) => acc + item.cantidad, 0);

    if (total === 0) {
        throw new Error("El total de cantidades es 0. No se pueden calcular porcentajes.");
    }

    dataRows.forEach(item => {
        item.porcentaje = item.cantidad / total; // valor entre 0 y 1
    });

    // Crear un nuevo Excel con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Novedades");

    // Título
    worksheet.mergeCells("A1:C1");
    const tituloCell = worksheet.getCell("A1");
    tituloCell.value = "Novedades Académicas";
    tituloCell.alignment = { horizontal: "center", vertical: "middle" };
    tituloCell.font = { bold: true, size: 14 };
    tituloCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }
    };

    // Encabezados
    const headerRow = worksheet.addRow(["Novedad Académica", "Cantidad", "Porcentaje"]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB4C6E7" }
    };

    // Columnas anchas
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;

    // Filas de datos
    dataRows.forEach(item => {
        const row = worksheet.addRow([
            item.novedad,
            item.cantidad,
            item.porcentaje
        ]);
        row.getCell(2).numFmt = "#,##0";
        row.getCell(3).numFmt = "0.00%";
    });

    // Bordes sencillos para la tabla
    const lastRowNumber = worksheet.lastRow.number;
    for (let rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        for (let col = 1; col <= 3; col++) {
            const cell = row.getCell(col);
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } }
            };
        }
    }

    // Crear imagen del gráfico de pastel con Chart.js y agregarla al Excel
    const labels = dataRows.map(item => item.novedad);
    const cantidades = dataRows.map(item => item.cantidad);

    const backgroundColors = [
        "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5",
        "#70AD47", "#264478", "#9E480E", "#636363", "#997300"
    ];

    const chartConfig = {
        type: "pie",
        data: {
            labels: labels.map((label, idx) => {
                const value = cantidades[idx];
                const porcentaje = (value / total) * 100;
                return `${label} (${value} - ${porcentaje.toFixed(1)}%)`;
            }),
            datasets: [
                {
                    data: cantidades,
                    backgroundColor: backgroundColors.slice(0, cantidades.length),
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "#000000",
                        font: {
                            size: 10,
                        },
                    },
                },
                title: {
                    display: true,
                    text: "Novedades Académicas",
                    color: "#000000",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                datalabels: {
                    color: "#FFFFFF",
                    font: {
                        weight: "bold",
                        size: 11,
                    },
                },
            },
        },
        // Habilitar el plugin de data labels en QuickChart
        plugins: ["datalabels"],
    };

    // Generar la imagen de la gráfica usando QuickChart
    const qc = new QuickChart();
    qc.setConfig(chartConfig);
    qc.setWidth(chartWidth);
    qc.setHeight(chartHeight);
    qc.setBackgroundColor("white");

    const chartBuffer = await qc.toBinary();

    const imageId = workbook.addImage({
        buffer: chartBuffer,
        extension: "png"
    });

    // Insertar la imagen debajo de la tabla
    const imageStartRow = lastRowNumber + 3;
    const imageEndRow = imageStartRow + 20;
    worksheet.addImage(imageId, {
        tl: { col: 0, row: imageStartRow - 1 },
        br: { col: 8, row: imageEndRow - 1 }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Novedades_Academicas_${Date.now()}.xlsx`;

    return { buffer, fileName, dataRows };
}

module.exports = {
    generarExcelNovedades
};
