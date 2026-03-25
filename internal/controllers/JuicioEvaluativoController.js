const { procesarExcel } = require("../services/ExcelReader");

// Cache en memoria para relacionar un upload con sus datos de reporte.
const cache = new Map();

async function uploadJuicios(req, res) {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: "No se recibió ningún archivo válido" });
    }

    const rutaArchivo = req.file.path;
    console.log("📁 Archivo recibido:", req.file.originalname);
    console.log("📍 Ruta temporal:", rutaArchivo);

    const resumen = await procesarExcel(rutaArchivo);
    console.log("✅ Juicios procesados:", resumen.length);

    const archivoId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const ficha = resumen[0]?.ficha || "SIN_FICHA";

    cache.set(archivoId, {
      resumenGlobal: resumen,
      ficha,
      createdAt: Date.now()
    });

    return res.status(200).json({
      msg: "Archivo procesado correctamente",
      resumen,
      archivoId
    });
  } catch (error) {
    console.error("❌ Error procesando Excel:", error.message);
    return res.status(500).json({ msg: "Error interno al procesar el archivo" });
  } finally {
    if (req.file?.path) {
      require("fs").unlink(req.file.path, () => {});
    }
  }
}

module.exports = {
  uploadJuicios,
  cache
};
