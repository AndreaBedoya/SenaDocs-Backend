const archiver = require("archiver");
const documentService = require("../services/DocumentService");
const db = require("../models");
const DOCUMENTOS = db.DOCUMENTOS;

exports.renombrarDescargar = async (req, res) => {
    let archive = null;
    
    try {
        const files = req.files;
        const { nombreCarpeta, fichaAsignada } = req.body;
        const usuarioId = req.user ? req.user.id : null;

        // Validaciones antes de iniciar el ZIP
        if (!files || files.length === 0) {
            console.error('Error: No se recibieron archivos');
            return res.status(400).json({ message: "No se recibieron archivos PDF."});
        }

        if (!nombreCarpeta || nombreCarpeta.trim() === '') {
            console.error('Error: No se recibió nombre de carpeta');
            return res.status(400).json({ message: "Debes proporcionar el nombre de la carpeta."});
        }

        // Procesar todos los archivos ANTES de crear el ZIP
        // Usar Promise.allSettled para que un archivo fallido no detenga todo el proceso
        const processingPromises = files.map((file, index) => {
            return documentService.processPdfForRenaming(file, fichaAsignada)
                .then(result => ({ status: 'fulfilled', value: result, file: file.originalname }))
                .catch(error => ({ status: 'rejected', reason: error, file: file.originalname }));
        });

        const settledResults = await Promise.all(processingPromises);
        
        // Separar archivos exitosos de los que fallaron
        const processedResults = [];
        const errores = [];
        
        settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                processedResults.push(result.value);
            } else {
                errores.push({
                    archivo: result.file,
                    error: result.reason.message || 'Error desconocido'
                });
                console.error(`Archivo ${index + 1} falló: ${result.file} - ${result.reason.message}`);
            }
        });

        if (errores.length > 0) {
            console.warn(`${errores.length}`);
        }

        // Validar que al menos un archivo se procesó correctamente
        if (processedResults.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "No se pudieron procesar ningún archivo PDF.",
                errores: errores
            });
        }

        // Ahora sí, configurar el ZIP después de validar que todo está bien
        const zipFileName = `${nombreCarpeta}_Renombrado.zip`;
        res.attachment(zipFileName);

        archive = archiver("zip", { zlib: { level: 9 } });
        
        archive.on("error", (err) => {
            console.error("Error al crear el ZIP", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Error en la compresion del archivo ZIP."});
            }
        });

        archive.pipe(res);

        // Iterar resultados, construir la estructura ZIP y registrar en BD
        for (const result of processedResults) {
            const { buffer, fichaFinal, nuevoNombreCompleto, originalName } = result;

            // Validar que el nombre no sea undefined
            if (!nuevoNombreCompleto || nuevoNombreCompleto === 'undefined' || nuevoNombreCompleto.includes('undefined')) {
                console.error(`nombre generado es inválido para ${originalName}:`, nuevoNombreCompleto);
                console.error('Resultado completo:', result);
                // Generar un nombre mejor usando los datos disponibles
                const extension = originalName.split(".").pop() || "pdf";
                let nombreRespaldo;
                
                if (fichaFinal) {
                    // Intentar extraer documento del nombre original
                    const docMatch = originalName.match(/^(\d{8,12})/);
                    const doc = docMatch ? docMatch[1] : "DOC";
                    nombreRespaldo = `${doc}_${fichaFinal}.${extension}`;
                } else {
                    // Último recurso: usar nombre original sin extensión
                    nombreRespaldo = `${originalName.replace(/\.pdf$/i, '')}.${extension}`;
                }
                
                console.log(`Usando nombre de respaldo (si hay en el archivo): ${nombreRespaldo}`);
                
                const folderPath = `${nombreCarpeta}/${nombreCarpeta} ${fichaFinal}/${nombreRespaldo}`;
                archive.append(buffer, { name: folderPath });
                continue;
            }

            // Nomenclatura
            const folderPath = `${nombreCarpeta}/${nombreCarpeta} ${fichaFinal}/${nuevoNombreCompleto}`;

            archive.append(buffer, { name: folderPath });

            // Registro en DOCUMENTOS
            // Convertir fichaFinal a número y usar un tipo_documento válido
            try {
                const fichaIdNumero = parseInt(fichaFinal);
                if (isNaN(fichaIdNumero)) {
                    console.warn(`La Ficha "${fichaFinal}" no es un número válido para el archivo ${originalName}`);
                } else {
                    await DOCUMENTOS.create({
                        usuario_id: usuarioId,
                        ficha_id: fichaIdNumero,
                        tipo_documento: "NOVEDAD_ACADEMICA", // Usar un valor válido del ENUM
                        nombre_original_archivo: originalName,
                        nombre_final_generado: nuevoNombreCompleto,
                    });
                    console.log(`Documento ${originalName} registrado en BD`);
                }
            } catch (dbError) {
                console.error(`Error al registrar documento ${originalName} en BD:`, dbError.message);
                // No detenemos el proceso si falla el registro en BD
            }
        }

        // Finalizar el ZIP y enviarlo al cliente
        archive.finalize();
        
        // Si hubo errores, los registramos pero no detenemos el proceso
        if (errores.length > 0) {
            console.warn(`Advertencia: ${errores.length} archivo(s) no pudieron procesarse pero el ZIP se generó con los archivos válidos`);
        }

    } catch (error) {
        console.error("Error en el proceso de renombrado:", error);
        console.error("Stack trace:", error.stack);
        
        // Si el ZIP ya se inició, intentar abortarlo
        if (archive) {
            try {
                archive.abort();
            } catch (abortError) {
                console.error("Error al abortar el archivo ZIP:", abortError);
            }
        }
        
        // Solo enviar respuesta JSON si los headers no se enviaron
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false,
                message: error.message || "Error interno al procesar los documentos.",
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            // Si los headers ya se enviaron, no podemos enviar JSON
            // El cliente recibirá un ZIP vacío o corrupto
            console.error("No se puede enviar respuesta de error: headers ya enviados");
            console.error("El cliente recibirá un ZIP vacío o corrupto");
        }
    }
};