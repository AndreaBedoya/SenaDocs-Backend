const fs = require("fs");
const path = require("path");
const os = require("os");
const documentService = require("../services/DocumentService");
const db = require("../models");
const DOCUMENTOS = db.DOCUMENTOS;

/**
 * Renombra los PDFs y los guarda directamente en el Escritorio del equipo donde corre el backend.
 */
exports.renombrarGuardarEnEscritorio = async (req, res) => {
    try {
        const files = req.files;
        const { nombreCarpeta, fichaAsignada } = req.body;
        const usuarioId = req.user ? req.user.id : null;

        if (!files || files.length === 0) {
            console.error("Error: No se recibieron archivos");
            return res.status(400).json({ success: false, message: "No se recibieron archivos PDF." });
        }

        if (!nombreCarpeta || nombreCarpeta.trim() === "") {
            console.error("Error: No se recibió nombre de carpeta");
            return res.status(400).json({ success: false, message: "Debes proporcionar el nombre de la carpeta." });
        }

        // Procesar todos los archivos
        const processingPromises = files.map((file) => {
            return documentService
                .processPdfForRenaming(file, fichaAsignada)
                .then((result) => ({ status: "fulfilled", value: result, file: file.originalname }))
                .catch((error) => ({ status: "rejected", reason: error, file: file.originalname }));
        });

        const settledResults = await Promise.all(processingPromises);

        const processedResults = [];
        const errores = [];

        settledResults.forEach((result, index) => {
            if (result.status === "fulfilled") {
                processedResults.push(result.value);
            } else {
                errores.push({
                    archivo: result.file,
                    error: result.reason.message || "Error desconocido",
                });
                console.error(`Archivo ${index + 1} falló: ${result.file} - ${result.reason.message}`);
            }
        });

        if (processedResults.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se pudieron procesar ningún archivo PDF.",
                errores,
            });
        }

        // Determinar ruta del Escritorio
        const homeDir = os.homedir();
        let desktopPath = path.join(homeDir, "Desktop");
        if (!fs.existsSync(desktopPath)) {
            // Fallback común en sistemas en español
            const altDesktop = path.join(homeDir, "Escritorio");
            if (fs.existsSync(altDesktop)) {
                desktopPath = altDesktop;
            }
        }

        // Carpeta principal en el Escritorio
        const carpetaPrincipalPath = path.join(desktopPath, nombreCarpeta);
        const carpetaPrincipalExistia = fs.existsSync(carpetaPrincipalPath);

        if (!carpetaPrincipalExistia) {
            fs.mkdirSync(carpetaPrincipalPath, { recursive: true });
        }

        const archivosResultado = [];

        for (const result of processedResults) {
            const { buffer, fichaFinal, nuevoNombreCompleto, originalName } = result;

            if (!nuevoNombreCompleto || nuevoNombreCompleto === "undefined" || nuevoNombreCompleto.includes("undefined")) {
                console.error(`Nombre generado es inválido para ${originalName}:`, nuevoNombreCompleto);
                console.error("Resultado completo:", result);
                const extension = originalName.split(".").pop() || "pdf";
                let nombreRespaldo;

                if (fichaFinal) {
                    const docMatch = originalName.match(/^(\d{8,12})/);
                    const doc = docMatch ? docMatch[1] : "DOC";
                    nombreRespaldo = `${doc}_${fichaFinal}.${extension}`;
                } else {
                    nombreRespaldo = `${originalName.replace(/\.pdf$/i, "")}.${extension}`;
                }

                result.nuevoNombreCompleto = nombreRespaldo;
            }

            const fichaCarpetaNombre = `${nombreCarpeta} ${fichaFinal}`;
            const carpetaFichaPath = path.join(carpetaPrincipalPath, fichaCarpetaNombre);
            const carpetaFichaExistia = fs.existsSync(carpetaFichaPath);

            if (!carpetaFichaExistia) {
                fs.mkdirSync(carpetaFichaPath, { recursive: true });
            }

            const archivoPath = path.join(carpetaFichaPath, result.nuevoNombreCompleto);
            const archivoExistia = fs.existsSync(archivoPath);

            fs.writeFileSync(archivoPath, buffer);

            // Registrar en BD
            try {
                const fichaIdNumero = parseInt(fichaFinal);
                if (isNaN(fichaIdNumero)) {
                    console.warn(`La Ficha "${fichaFinal}" no es un número válido para el archivo ${originalName}`);
                } else {
                    await DOCUMENTOS.create({
                        usuario_id: usuarioId,
                        ficha_id: fichaIdNumero,
                        tipo_documento: "NOVEDAD_ACADEMICA",
                        nombre_original_archivo: originalName,
                        nombre_final_generado: result.nuevoNombreCompleto,
                    });
                }
            } catch (dbError) {
                console.error(`Error al registrar documento ${originalName} en BD:`, dbError.message);
            }

            archivosResultado.push({
                archivo_original: originalName,
                archivo_final: result.nuevoNombreCompleto,
                ficha: fichaFinal,
                ruta: archivoPath,
                estado_archivo: archivoExistia ? "actualizado" : "creado",
                estado_carpeta_principal: carpetaPrincipalExistia ? "actualizado" : "creado",
                estado_carpeta_ficha: carpetaFichaExistia ? "actualizado" : "creado",
            });
        }

        return res.status(200).json({
            success: true,
            mensaje_carpeta_principal: carpetaPrincipalExistia ? "actualizado" : "creado",
            carpeta_principal: carpetaPrincipalPath,
            archivos: archivosResultado,
            errores,
        });
    } catch (error) {
        console.error("Error en el proceso de renombrado y guardado en Escritorio:", error);
        console.error("Stack trace:", error.stack);

        return res.status(500).json({
            success: false,
            message: error.message || "Error interno al procesar y guardar los documentos.",
            error: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
    }
};