const archiver = require("archiver");
const documentService = require("../services/DocumentService");
const db = require("../models");
const DOCUMENTOS = db.DOCUMENTOS;

exports.renombrarDescargar = async (req, res) => {
    const files = req.files;
    const { nombreCarpeta, fichaAsignada } = req.body;
    const usuarioId = req.user.id

    if (!files || files.length === 0 || !nombreCarpeta) {
        return res.status(400).json({ message: "Faltan archivos o el nombre de la carpeta."});
    }

    // Configuracion de Archiver (descarga ZIP)
    const zipFileName = `${nombreCarpeta}_Renombrado.zip`;
    res.attachment(zipFileName);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
        console.error("Error al crear el ZIP", err);
        if (!res.headersSent) {
            res.status(500).send({ error: "Error en la compresion del archivo ZIP."});
        }
    });
    archive.pipe(res);

    try {
        // Procesar todos los archivo en paralelo
        const processingPromises = files.map(file =>
            documentService.processPdfForRenaming(file, fichaAsignada)
        );

        const processedResults = await Promise.all(processingPromises);

        // Iterar resultados, construir la estructura ZIP y auditor
        for (const result of processedResults) {
            const { buffer, fichaFinal, nuevoNombreCompleto, originalName } = result;

            // Nomenclatura
            const folderPath = `${nombreCarpeta}/${nombreCarpeta} ${fichaFinal}/${nuevoNombreCompleto}`;

            archive.append(buffer, { name: folderPath });

            // (Registro en DOCUMENTOS).
            await DOCUMENTOS.create({
                usuario_id: usuarioId,
                ficha_id: fichaFinal,
                tipo_documento: "EVIDENCIA_PDF",
                nombre_original_archivo: originalName,
                nombre_final_generado: nuevoNombreCompleto,
            });
        }

        // Acabar el ZIP y enviarlo al cliente
        archive.finalize();

    } catch (error) {
        console.error("Error en el proceso de renombrado:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || "Error interno al procesar los documentos."});
        }
    }
};