const xlsx = require("xlsx");
const fs = require("fs");

async function procesarExcel(rutaExcel) {
  try {
    const buffer = fs.readFileSync(rutaExcel);
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(hoja, { header: 1 });

    if (!rows || rows.length < 13) {
      throw new Error("El archivo Excel no tiene el formato esperado (mínimo 13 filas)");
    }

    const ficha = rows[2]?.[2] ?? null;

    const normalizarNombre = (texto) => {
      if (typeof texto !== "string") return "";
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const NOMBRE_COLUMNAS = {
      "numero de documento": "documento",
      "nombre": "nombre",
      "apellidos": "apellido",
      "tipo de documento": "tipo_documento",
      "estado": "estado",
      "competencia": "competencia",
      "resultado de aprendizaje": "resultado",
      "juicio de evaluacion": "juicio",
      "fecha y hora del juicio evaluativo": "fecha_juicio",
      "funcionario que registro el juicio evaluativo": "funcionario"
    };

    const encabezadosExcel = rows[12] || [];
    const mapaIndices = {};

    encabezadosExcel.forEach((col, i) => {
      const normalizado = normalizarNombre(col);
      if (NOMBRE_COLUMNAS[normalizado]) {
        mapaIndices[NOMBRE_COLUMNAS[normalizado]] = i;
      }
    });

    if (!mapaIndices.documento || !mapaIndices.nombre || !mapaIndices.apellido || !mapaIndices.juicio) {
      throw new Error("No se encontraron las columnas necesarias en el encabezado del Excel");
    }

    const datosAprendices = rows.slice(13);
    const aprendicesAgrupados = {};

    datosAprendices.forEach((fila) => {
      if (!fila) return;
      fila = fila.map((v) => (v === null || v === undefined ? "" : v));
      if (fila.every((c) => c.toString().trim() === "")) return;

      const doc = fila[mapaIndices.documento];
      if (!doc) return;

      const docStr = doc.toString().trim();
      if (docStr === "" || !/\d/.test(docStr) || docStr.length < 5) return;

      const nombre = fila[mapaIndices.nombre];
      const apellido = fila[mapaIndices.apellido];
      const nombreLimpio = (nombre || "").toString().trim();
      const apellidoLimpio = (apellido || "").toString().trim();
      if (nombreLimpio === "" && apellidoLimpio === "") return;

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
    const resumen = [];

    lista.forEach((aprendiz) => {
      const item = {
        documento: aprendiz.documento,
        nombre: `${aprendiz.nombre} ${aprendiz.apellido}`,
        ficha,
        juicios: aprendiz.juicios.length
      };

      let aprobados = 0;
      let porEvaluar = 0;

      aprendiz.juicios.forEach((j) => {
        const juicioTexto = (j.juicio || "").toString().trim().toUpperCase();
        if (juicioTexto === "APROBADO") aprobados++;
        if (juicioTexto === "POR EVALUAR") porEvaluar++;
      });

      item.juiciosAprobados = aprobados;
      item.juiciosPorEvaluar = porEvaluar;
      item.porcentajeJuiciosEvaluados = Math.round((aprobados / item.juicios) * 100) + "%";
      item.porcentajeJuiciosPorEvaluar = Math.round((porEvaluar / item.juicios) * 100) + "%";

      resumen.push(item);
    });

    return resumen;
  } catch (error) {
    console.error("❌ Error en procesarExcel:", error.message);
    throw error;
  }
}

module.exports = {
  procesarExcel
};
