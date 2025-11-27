const multer = require("multer");

// Se usa memoryStorage para que Multer guarde los archivos
// en un buffer (RAM) en lugar de en el disco.
const storage = multer.memoryStorage();

// middleware de Multer para aceptar hasta 100 archivos
const uploadFiles = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 *1024
    }
}).array("documentos", 100); //nombre del campo de formulario

module.exports = uploadFiles;