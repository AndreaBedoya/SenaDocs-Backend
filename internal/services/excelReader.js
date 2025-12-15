const readExcelFile = require('read-excel-file/node');

async function procesarExcel(rutaExcel) {
    const rows = await readExcelFile(rutaExcel);

    const ficha = rows[2]?.[2] ?? null;

    const normalizarNombre = (texto) => {
        if (typeof texto !== 'string') return '';
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const NOMBRE_COLUMNAS = {
        'numero de documento': 'documento',
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

    const encabezadosExcel = rows[12] || [];
    const mapaIndices = {};

    for (let i = 0; i < encabezadosExcel.length; i++) {
        const normalizado = normalizarNombre(encabezadosExcel[i]);
        if (NOMBRE_COLUMNAS[normalizado]) {
            mapaIndices[NOMBRE_COLUMNAS[normalizado]] = i;
        }
    }

    const datosAprendices = rows.slice(13);
    const aprendicesAgrupados = {};

    datosAprendices.forEach(fila => {
        if (!fila) return;

        // LIMPIAR FILA (convertir null o undefined a "")
        fila = fila.map(v => (v === null || v === undefined ? "" : v));

        // Fila completamente vacía
        if (fila.every(c => c.toString().trim() === "")) return;

        const doc = fila[mapaIndices.documento];

        // Documento inexistente
        if (!doc) return;

        const docStr = doc.toString().trim();

        // Documento vacío o solo espacios
        if (docStr === "") return;

        // Documento NO contiene números
        if (!/\d/.test(docStr)) return;

        // Documento demasiado corto
        if (docStr.length < 5) return;

        const nombre = fila[mapaIndices.nombre];
        const apellido = fila[mapaIndices.apellido];

        // fila con documento pero sin nombre y apellido
        const nombreLimpio = (nombre || "").toString().trim();
        const apellidoLimpio = (apellido || "").toString().trim();

        if (nombreLimpio === "" && apellidoLimpio === "") return;

        // Crear aprendiz si no existe
        if (!aprendicesAgrupados[docStr]) {
            aprendicesAgrupados[docStr] = {
                documento: docStr,
                nombre: nombreLimpio,
                apellido: apellidoLimpio,
                juicios: []
            };
        }

        const juicio = {};
        for (const [prop, idx] of Object.entries(mapaIndices)) {
            juicio[prop] = fila[idx] ?? "";
        }

        aprendicesAgrupados[docStr].juicios.push(juicio);
    });

    const lista = Object.values(aprendicesAgrupados);
    console.log(aprendicesAgrupados.length);
    const resumen = [];

    lista.forEach(aprendiz => {
        const item = {};

        item.documento = aprendiz.documento;
        item.nombre = `${aprendiz.nombre} ${aprendiz.apellido}`;
        item.ficha = ficha;
        item.juicios = aprendiz.juicios.length;

        let aprobados = 0;
        let porEvaluar = 0;

        aprendiz.juicios.forEach(j => {
            const eval = (j.juicio || "").toString().trim().toUpperCase();
            if (eval === "APROBADO") aprobados++;
            if (eval === "POR EVALUAR") porEvaluar++;
        });

        item.juiciosAprobados = aprobados;
        item.juiciosPorEvaluar = porEvaluar;

        item.porcentajeJuiciosEvaluados =
            Math.round((aprobados / item.juicios) * 100) + "%";

        item.porcentajeJuiciosPorEvaluar =
            Math.round((porEvaluar / item.juicios) * 100) + "%";

        resumen.push(item);
    });
    console.log(resumen.length);

    return resumen;
}

module.exports = {
    procesarExcel
};
