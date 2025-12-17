const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');

const PDF_OPTIONS = {
    format: 'A4',
    orientation: 'portrait'
};

const pdfDir = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
}

function generarContenidoHtmlDetalle(aprendiz, ficha) {
    const juicios = aprendiz.juicios;
    let filasJuicios = '';

    juicios.forEach(juicio => {
        const juicioStr = (juicio.juicio || "").toString().trim().toUpperCase();
        let color = 'black';
        if (juicioStr === 'APROBADO') color = 'green';
        else if (juicioStr === 'POR EVALUAR') color = 'orange';
        else if (juicioStr !== '') color = 'red';

        filasJuicios += `
        <tr>
            <td>${juicio.competencia}</td>
            <td>${juicio.resultado}</td>
            <td style="color: ${color};">${juicio.juicio}</td>
        </tr>
        `;
    });

    // Calcular porcentajes
    const totalJuicios = juicios.length;
    const aprobados = juicios.filter(j => (j.juicio || "").toString().trim().toUpperCase() === "APROBADO").length;
    const porcentajeAvance = totalJuicios > 0 ? Math.round((aprobados / totalJuicios) * 100) : 0;


    return `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 30px; }
            h1, h2, h3 { color: #004d99; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .resumen { background-color: #e6f7ff; padding: 10px; border-radius: 5px; margin-bottom: 20px;}
        </style>
    </head>
    <body>
        <h1>Reporte Individual de Avance</h1>
        <h2>Ficha: ${ficha}</h2>
        
        <div class="resumen">
            <h3>Aprendiz: ${aprendiz.nombre} ${aprendiz.apellido} )</h3>
            <h3>Documento: ${aprendiz.documento}</h3>
            <p><strong>Avance Aprobado:</strong> ${porcentajeAvance}% (${aprobados} de ${totalJuicios} juicios aprobados)</p>
        </div>

        <h3>Detalle de Evaluaciones</h3>
        <table>
            <thead>
                <tr>
                    <th>Competencia</th>
                    <th>Resultado de Aprendizaje</th>
                    <th>Juicio</th>
                </tr>
            </thead>
            <tbody>
                ${filasJuicios}
            </tbody>
        </table>
    </body>
    </html>
    `;
}

async function generarPDFDetalle(aprendiz, ficha) {
    const contenido = generarContenidoHtmlDetalle(aprendiz, ficha);
    const nombreArchivo = `ReporteIndividual_${aprendiz.documento}_${Date.now()}.pdf`;
    const rutaSalida = path.join(pdfDir, nombreArchivo);

    return new Promise((resolve, reject) => {
        pdf.create(contenido, PDF_OPTIONS).toFile(rutaSalida, (err, res) => {
            if (err) return reject(err);
            resolve(rutaSalida);
        });
    });
}

function generarContenidoHtmlElegibles(elegibles, ficha) {
    let filas = '';

    elegibles.forEach(aprendiz => {
        filas += `
        <tr>
            <td>${aprendiz.documento}</td>
            <td>${aprendiz.nombre}</td>
            <td>${aprendiz.juiciosAprobados}</td>
            <td style="color: ${parseFloat(aprendiz.porcentajeJuiciosEvaluados) >= 75 ? 'green' : 'orange'};">${aprendiz.porcentajeJuiciosEvaluados}</td>
            <td>${aprendiz.juicios}</td>
        </tr>
        `;
    });

    return `
    <html>
    <head>
        <style>...</style> </head>
    <body>
        <h1>Reporte de Aprendices Elegibles (>= 75% Aprobado)</h1>
        <h2>Ficha: ${ficha} (${elegibles.length} elegibles)</h2>
        <table>
            <thead>
                <tr>
                    <th>Documento</th>
                    <th>Nombre Completo</th>
                    <th>Aprobados</th>
                    <th>% Avance</th>
                    <th>Total Juicios</th>
                </tr>
            </thead>
            <tbody>
                ${filas}
            </tbody>
        </table>
    </body>
    </html>
    `;
}

async function generarPDFElegibles(elegibles, ficha) {
    const contenido = generarContenidoHtmlElegibles(elegibles, ficha);
    const nombreArchivo = `ReporteElegibles_${ficha}_${Date.now()}.pdf`;
    const rutaSalida = path.join(pdfDir, nombreArchivo);

    return new Promise((resolve, reject) => {
        pdf.create(contenido, PDF_OPTIONS).toFile(rutaSalida, (err, res) => {
            if (err) return reject(err);
            resolve(rutaSalida);
        });
    });
}

module.exports = {
    generarPDFDetalle,
    generarPDFElegibles
};