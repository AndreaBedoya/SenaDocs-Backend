const pdf = require('html-pdf');
const procesarExcel = require('./excelReader')

let filas = '';

for (const aprendiz of procesarExcel) {
    filas += `
    <tr>
        <td>${aprendiz.documento}</td>
        <td>${aprendiz.nombre}</td>
        <td>${aprendiz.ficha}</td>
        <td>${aprendiz.juiciosAprobados} ${aprendiz.porcentajeJuiciosEvaluados}</td>
        <td>${aprendiz.juiciosPorEvaluar} ${aprendiz.porcentajeJuiciosPorEvaluar}</td>
        <td>${aprendiz.juicios}</td>
`;
}


contenido = `
    <body>
        <h1>Prueba de pdf</h1>
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Ficha</th>
                    <th>Juicios Aprobados</th>
                    <th>Juicios por Evaluar</th>
                    <th>Total de Juicios</th>
                </tr>
            </thead>
            <tbody>
                ${filas}
            </tbody>
        </table>
    </body>
    `;
pdf.create(contenido).toFile('./salida.pdf', (err, data) => {
    if (err){
        console.log(err);
    } else {
        console.log(data);
    }
})