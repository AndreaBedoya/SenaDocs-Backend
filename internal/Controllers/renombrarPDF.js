import fs from "fs";
import path from "path";
import os from "os";

export const organizarYRenombrarPDF = (req, res) => {
  try {
    const { carpeta } = req.body;
    const archivos = req.files["archivos"];

    if (!archivos || archivos.length === 0) {
      return res.status(400).json({ error: "No se enviaron archivos PDF" });
    }

    if (!carpeta) {
      return res.status(400).json({ error: "Debes ingresar el nombre de la carpeta principal" });
    }

    const escritorio = path.join(os.homedir(), "Desktop");
    const carpetaPrincipal = path.join(escritorio, carpeta);
    fs.mkdirSync(carpetaPrincipal, { recursive: true });

    let cantidad = 0;
    let carpetasCreadas = new Set();
    let errores = [];

    archivos.forEach((archivo) => {
      const nombreOriginal = archivo.originalname;
      const ext = path.extname(nombreOriginal).toLowerCase();
      if (ext !== ".pdf") return;

      const partes = nombreOriginal.replace(".pdf", "").split(/[\s_-]+/);

      // Detectar números
      const numeros = partes.filter(p => /^\d{6,10}$/.test(p));
      const fichaDetectada = numeros.find(n => n.length === 6 || n.length === 7);
      const cedulaDetectada = numeros.find(n => n.length >= 8 && n.length <= 10 && n !== fichaDetectada);

      // Detectar nombre y apellido
      const nombres = partes.filter(p => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/i.test(p));
      const nombre = nombres[0] || "Nombre";
      const apellido = nombres.slice(1).join("_") || "Apellido";

      if (!cedulaDetectada || !fichaDetectada) {
        errores.push({ archivo: nombreOriginal, error: "No se pudo detectar cédula o ficha" });
        return;
      }

      const nuevoNombre = `${cedulaDetectada}_${nombre}_${apellido}.pdf`;
      const carpetaFicha = path.join(carpetaPrincipal, fichaDetectada);
      fs.mkdirSync(carpetaFicha, { recursive: true });
      carpetasCreadas.add(carpetaFicha);

      const nuevoPath = path.join(carpetaFicha, nuevoNombre);
      fs.renameSync(archivo.path, nuevoPath);
      cantidad++;
    });

    res.json({
      mensaje: "Archivos procesados correctamente",
      cantidad,
      carpetasCreadas: Array.from(carpetasCreadas),
      errores
    });
  } catch (err) {
    console.error("Error al organizar PDF:", err);
    res.status(500).json({ error: "Error interno al procesar archivos" });
  }
};
