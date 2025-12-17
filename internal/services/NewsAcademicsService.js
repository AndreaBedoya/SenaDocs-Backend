const readExcelFile = require('read-excel-file/node');

async function leerNovedades(rutaExcel) {
    const rows = await readExcelFile(rutaExcel);

    const NOMBRE_COLUMNAS = {
        'Novedad Académica': 'Retiro voluntario',
        'nombre': 'nombre',
        'apellidos': 'apellido',
        'tipo de documento': 'tipo_documento',
        'estado': 'estado',
        'competencia': 'competencia',
        'resultado de aprendizaje': 'resultado',
        'juicio de evaluacion': 'juicio',
        'fecha y hora del juicio evaluativo': 'fecha_juicio',
        'funcionario que registro el juicio evaluativo': 'funcionario'
    };

    return rows;
}

exports.leerNovedades = leerNovedades;


