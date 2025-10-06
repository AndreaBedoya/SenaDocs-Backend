import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// ---------------------------------------------
import registroRoutes from "./Routes/Registro.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;



app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Backend de SenaDocs funcionando correctamente");
});

app.use("/api", registroRoutes);


const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, "temp");
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: tempStorage });

function limpiarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/ñ|Ñ|Ã±|A±/g, "n")      // reemplaza ñ y variantes
    .replace(/[^\w\s-]/g, "")        // elimina caracteres corruptos
    .trim();
}

function eliminarFrasesExtra(texto) {
  return texto
    .replace(/documentos para certificarme.*$/i, "")
    .replace(/hoja de vida.*$/i, "")
    .replace(/exp.*$/i, "")
    .replace(/solicitud.*$/i, "")
    .trim();
}

function eliminarRepeticion(texto) {
  const palabras = texto.split(" ");
  const mitad = Math.floor(palabras.length / 2);
  const primera = palabras.slice(0, mitad).join(" ").toLowerCase();
  const segunda = palabras.slice(mitad).join(" ").toLowerCase();
  return primera === segunda ? palabras.slice(0, mitad).join(" ") : texto;
}

const nombresComunes = [
  "ana", "andrea", "carlos", "camilo", "diana", "edwin", "alexander", "juan", "luis",
  "mildred", "maria", "jose", "laura", "sofia", "pedro", "jorge", "daniel", "valentina",
  "sebastian", "alejandra", "julian", "natalia", "miguel", "isabel", "fernando", "carolina",
  "esteban", "paula", "felipe", "santiago", "manuela", "ricardo", "martin", "melissa",
  "gustavo", "viviana", "andres", "monica", "diego", "adriana", "nicolas", "veronica",
  "leonardo", "claudia", "hugo", "patricia", "oscar", "vanessa", "cristian", "luisa",
  "raul", "angela", "fabian", "tatiana", "hector", "marcela", "alvaro", "karina",
  "mauricio", "yesica", "armando", "lorena", "reinaldo", "gloria", "ivan", "nury",
  "elizabeth", "jennifer", "freddy", "yolanda", "kevin", "maribel", "johana", "david",
  "lina", "cesar", "nidia", "victor", "milena", "roberto", "nora", "alejandro", "roxana",
  "jhon", "sandra", "jaime", "marina", "jair", "martha", "william", "beatriz", "harold",
  "ines", "edgar", "irma", "german", "rosa", "julio", "nelly", "elkin", "nancy", "margarita",
  "josefina", "catalina", "ronald", "lucia", "francisco", "doris", "alfonso", "esther",
  "eider", "graciela", "cristina", "marco", "emily", "luz", "angel", "noemi", "giovanni",
  "aurora", "ruben", "celeste", "jairo", "miryam", "melany", "edinson", "sara", "humberto",
  "dayana", "ezequiel", "carla", "fabio", "marlen", "eliana", "dilan", "brayan", "ximena",
  "yeison", "valeria", "jeison", "camila"
].map(n => limpiarTexto(n.toLowerCase()));

const apellidosComunes = [
  "gomez", "rodriguez", "lopez", "martinez", "garcia", "perez", "sanchez", "ramirez",
  "torres", "castro", "moreno", "jimenez", "ruiz", "gutierrez", "molina", "ortiz",
  "vargas", "suarez", "herrera", "ramos", "aguilar", "cortes", "valencia", "arias",
  "ospina", "montoya", "salazar", "mejia", "leon", "cardenas", "camacho", "avila",
  "barrera", "bustamante", "carvajal", "chavez", "cuellar", "delgado", "duque",
  "escobar", "forero", "gonzalez", "ibarra", "jara", "lara", "macias", "maldonado",
  "marin", "mendoza", "munoz", "narvaez", "nieto", "nunez", "palacios", "parra",
  "pena", "quintero", "reyes", "rico", "rios", "rojas", "romero", "rubio", "salinas",
  "santana", "santos", "serrano", "silva", "solano", "soto", "tapia", "tejada",
  "tellez", "trujillo", "uribe", "vallejo", "vera", "villalba", "villanueva",
  "zambrano", "zapata", "zuniga"
].map(a => limpiarTexto(a.toLowerCase()));

function separarNombreApellido(partes) {
  const partesLimpias = partes.map(p => limpiarTexto(p.toLowerCase()));
  let nombreIndex = -1;
  let apellidoIndex = -1;

  partesLimpias.forEach((p, i) => {
    if (nombresComunes.includes(p) && nombreIndex === -1) nombreIndex = i;
    if (apellidosComunes.includes(p)) apellidoIndex = i;
  });

  if (apellidoIndex !== -1 && nombreIndex !== -1 && apellidoIndex < nombreIndex) {
    const nombre = partes.slice(apellidoIndex + 1).join(" ");
    const apellido = partes.slice(0, apellidoIndex + 1).join(" ");
    return [nombre, apellido];
  }

  if (nombreIndex !== -1) {
    const nombre = partes.slice(0, nombreIndex + 1).join(" ");
    const apellido = partes.slice(nombreIndex + 1).join(" ");
    return [nombre, apellido];
  }

  return [partes[0], partes.slice(1).join(" ")];
}

app.post("/api/upload", upload.fields([
  { name: "archivos", maxCount: 100 },
  { name: "carpeta" },
  { name: "ficha" }
]), (req, res) => {
  const carpeta = limpiarTexto(req.body.carpeta || "");
  const fichaManual = req.body.ficha?.trim();

  if (!carpeta || !req.files?.archivos?.length) {
    return res.status(400).json({ error: "Falta carpeta principal o archivos" });
  }

  let archivosProcesados = [];
  let errores = [];
  let carpetasCreadas = new Set();

  req.files.archivos.forEach((file) => {
    let nombreOriginal = file.originalname.replace(".pdf", "");
    nombreOriginal = limpiarTexto(nombreOriginal).replace(/\s*\(\d+\)$/, "");
    nombreOriginal = eliminarFrasesExtra(nombreOriginal);
    nombreOriginal = eliminarRepeticion(nombreOriginal);

    const numeros = nombreOriginal.match(/\d+/g) || [];
    let cedula = null;
    let fichaDetectada = fichaManual || null;

    numeros.forEach((num) => {
      if (num.length > 7 && !cedula) cedula = num;
      else if ((num.length === 6 || num.length === 7) && !fichaDetectada) fichaDetectada = num;
    });

    if (!cedula || !fichaDetectada) {
      errores.push({ archivo: file.originalname, error: "No se detectó cédula o ficha" });
      return;
    }

    const nombreSinNumeros = nombreOriginal.replace(cedula, "").replace(fichaDetectada, "").replace(/[-_]+$/, "");
    let partes = nombreSinNumeros.split(/[-_ ]/).map(p => p.trim()).filter(Boolean);
    const [nombre, apellido] = separarNombreApellido(partes);

    if (!nombre || !apellido) {
      errores.push({ archivo: file.originalname, error: "Nombre o apellido faltante" });
      return;
    }

    const nuevoNombre = `${cedula}_${nombre}_${apellido}.pdf`;
    const destinoFinal = path.join(__dirname, carpeta, fichaDetectada);

    if (!fs.existsSync(destinoFinal)) {
      fs.mkdirSync(destinoFinal, { recursive: true });
      carpetasCreadas.add(fichaDetectada);
    }

    const nuevoPath = path.join(destinoFinal, nuevoNombre);
    if (fs.existsSync(nuevoPath)) {
      fs.unlinkSync(nuevoPath);
    }

    fs.renameSync(file.path, nuevoPath);
    archivosProcesados.push({ ficha: fichaDetectada, archivo: nuevoNombre });
  });

  res.json({
    mensaje: "Proceso completado",
    carpeta,
    cantidad: archivosProcesados.length,
    archivos: archivosProcesados,
    errores,
    carpetasCreadas: Array.from(carpetasCreadas)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend de SenaDocs corriendo en http://localhost:${PORT}`);
});
