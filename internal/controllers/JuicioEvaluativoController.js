const { procesarExcel } = require("../services/ExcelReader");
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

    return res.status(200).json({
      msg: "Archivo procesado correctamente",
      resumen
    });
  } catch (error) {
    console.error("❌ Error procesando Excel:", error.message);
    return res.status(500).json({ msg: "Error interno al procesar el archivo" });
  }
}

module.exports = {
    uploadJuicios,
    cache
};