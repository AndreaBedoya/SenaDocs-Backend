let pdfParse;
try {
    const pdfParseModule = require("pdf-parse");

    if (typeof pdfParseModule === 'function') {
        pdfParse = pdfParseModule;
    } 

    else if (typeof pdfParseModule === 'object' && typeof pdfParseModule.call === 'function') {
        pdfParse = pdfParseModule;
    }

    else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        pdfParse = pdfParseModule.default;
    }

    else if (pdfParseModule.PDFParse) {
        // El módulo puede ser callable aunque sea un objeto
        pdfParse = pdfParseModule;
    }
    else {
        pdfParse = pdfParseModule;
    }
} catch (e) {
    console.error('Error al importar pdf-parse:', e);
    throw new Error('pdf-parse no está instalado. Ejecuta: npm install pdf-parse');
}

// Extraer metadatos del nombre del archivo como respaldo
function extractMetadataFromFilename(filename) {
    const data = {
        documento: null,
        nombreCompleto: null,
        fichaPDF: null,
    };

    console.log(`Extrayendo metadatos del nombre del archivo: ${filename}`);

    // Normalizar la codificación UTF-8
    let normalizedFilename = filename;
    try {
        console.log(`Nombre original: "${filename}"`);

        if (normalizedFilename.includes('Ã')) {
            try {
                const decoded = Buffer.from(normalizedFilename, 'latin1').toString('utf8');
                if (!decoded.includes('Ã')) {
                    normalizedFilename = decoded;
                    console.log(`Nombre después de decodificar latin1->utf8: "${normalizedFilename}"`);
                }
            } catch (e) {
                console.warn('Error al decodificar latin1->utf8:', e.message);
            }
        }
        
        // Mapeo de caracteres mal codificados comunes
        const encodingFix = {
            'Ã±': 'ñ', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
            'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã"': 'Ó', 'Ãš': 'Ú',
            'Ã±': 'Ñ', 'Ã§': 'ç', 'Ã£': 'ã', 'Ãµ': 'õ'
        };
        
        // Reemplazar caracteres mal codificados que aún queden
        for (const [wrong, correct] of Object.entries(encodingFix)) {
            if (normalizedFilename.includes(wrong)) {
                normalizedFilename = normalizedFilename.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
            }
        }
        
        console.log(`Nombre final normalizado: "${normalizedFilename}"`);
    } catch (e) {
        console.warn('Error al normalizar codificación del nombre del archivo:', e.message);
        normalizedFilename = filename;
    }

    // Remover la extensión
    const nameWithoutExt = normalizedFilename.replace(/\.pdf$/i, '');
    console.log(`Nombre sin extensión (normalizado): ${nameWithoutExt}`);

    const noDocumentoMatch = nameWithoutExt.match(/^NO[_\s]*DOCUMENTO[_\s]+(.+)[_\s]+(\d{6,10})$/i);
    if (noDocumentoMatch) {
        console.log('Archivo con formato NO_DOCUMENTO detectado');
        data.documento = null; // No hay documento numérico
        data.fichaPDF = noDocumentoMatch[2];
        let nombreRaw = noDocumentoMatch[1].trim();
        
        console.log(`Nombre raw extraído de NO_DOCUMENTO: "${nombreRaw}"`);

        let cleanName = nombreRaw
            .replace(/[_\s]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();
        
        // Limpiar palabras comunes que puedan aparecer
        cleanName = cleanName.replace(/\b(DOCUMENTOS?|CERTIFICADOS?|EVIDENCIAS?|ARCHIVOS?|PDFS?)\b/gi, '').trim();
        cleanName = cleanName.replace(/[_\s]+/g, '_').replace(/^_+|_+$/g, '');
        
        if (cleanName.length > 3) {
            data.nombreCompleto = cleanName;
            console.log(`Nombre extraído de NO_DOCUMENTO: ${data.nombreCompleto}`);
            console.log(`Ficha extraída: ${data.fichaPDF}`);
            console.log('Metadatos finales del nombre del archivo:', data);
            return data;
        } else {
            console.log(`Nombre extraído muy corto: "${cleanName}" (longitud: ${cleanName.length})`);
        }
    }

    // Buscar documento
    let docMatch = nameWithoutExt.match(/^(\d{8,12})/);
    if (docMatch) {
        data.documento = docMatch[1];
        console.log(`Documento encontrado (al inicio): ${data.documento}`);
    } else {
        docMatch = nameWithoutExt.match(/(\d{8,12})/);
        if (docMatch) {
            data.documento = docMatch[1];
            console.log(`Documento encontrado (en cualquier parte): ${data.documento}`);
        } else {
            console.log('No se encontró documento en el nombre del archivo');
        }
    }

    // Buscar ficha
    let fichaMatch = nameWithoutExt.match(/(\d{6,7})(?:\s*\.pdf)?$/i);
    if (fichaMatch) {
        // Verificar que no sea el mismo que el documento
        if (fichaMatch[1] !== data.documento) {
            data.fichaPDF = fichaMatch[1];
            console.log(`Ficha encontrada (al final): ${data.fichaPDF}`);
        } else {
            console.log('Número al final coincide con el documento, no es ficha');
            // Buscar otra ficha en cualquier parte
            fichaMatch = nameWithoutExt.match(/(\d{6,10})/);
            if (fichaMatch && fichaMatch[1] !== data.documento) {
                data.fichaPDF = fichaMatch[1];
                console.log(`Ficha encontrada (en cualquier parte): ${data.fichaPDF}`);
            }
        }
    } else {
        fichaMatch = nameWithoutExt.match(/(\d{6,10})/);
        if (fichaMatch) {
            // Verificar que no sea el mismo que el documento
            if (fichaMatch[1] !== data.documento) {
                data.fichaPDF = fichaMatch[1];
                console.log(`Ficha encontrada (en cualquier parte): ${data.fichaPDF}`);
            } else {
                console.log('Número encontrado pero coincide con el documento, no es ficha');
            }
        } else {
            console.log('No se encontró ficha en el nombre del archivo');
        }
    }

    // Buscar nombre
    let nameMatch = nameWithoutExt.match(/^\d{8,12}\s+(.+?)\s+\d{6,8}$/);
    if (nameMatch && nameMatch[1]) {
        let nombreRaw = nameMatch[1].trim();
        console.log(`Nombre raw extraído: "${nombreRaw}"`);

        let cleanName = nombreRaw
            .replace(/\b(Documentos?|Certificados?|Evidencias?|Archivos?|PDFs?)\b/gi, '')
            .trim();

        if (cleanName.length < 5 || cleanName === '') {
            cleanName = nombreRaw;
        }

        cleanName = cleanName.replace(/\s+/g, ' ').trim().replace(/\s+/g, '_').toUpperCase();
        
        console.log(`Nombre normalizado final: "${cleanName}"`);
        
        if (cleanName.length > 3) {
            data.nombreCompleto = cleanName;
            console.log(`Nombre encontrado del archivo: ${data.nombreCompleto}`);
        } else {
            console.log('Nombre encontrado pero muy corto después de limpiar');
        }
    } else {
        console.log('No se encontró nombre en el patrón principal');
        const altMatch = nameWithoutExt.match(/^\d{8,12}\s+(.+?)\s+\d{6,8}/);
        if (altMatch && altMatch[1]) {
            let cleanName = altMatch[1]
                .trim()
                .replace(/\b(Documentos?|Certificados?|Evidencias?)\b/gi, '')
                .trim()
                .replace(/\s+/g, '_')
                .toUpperCase();
            if (cleanName.length > 3) {
                data.nombreCompleto = cleanName;
                console.log(`Nombre encontrado (método alternativo): ${data.nombreCompleto}`);
            } else {
                console.log('Nombre del método alternativo muy corto');
            }
        } else {
            console.log('No se encontró nombre con método alternativo');
            const lastResortMatch = nameWithoutExt.match(/^\d{8,12}\s+(.+?)(?=\s+\d{6,8})/);
            if (lastResortMatch && lastResortMatch[1]) {
                let cleanName = lastResortMatch[1]
                    .trim()
                    .replace(/\b(Documentos?|Certificados?|Evidencias?)\b/gi, '')
                    .trim()
                    .replace(/\s+/g, '_')
                    .toUpperCase();
                if (cleanName.length > 3) {
                    data.nombreCompleto = cleanName;
                    console.log(`Nombre encontrado (último recurso): ${data.nombreCompleto}`);
                } else {
                    console.log('Nombre del último recurso muy corto');
                }
            } else {
                // Extraer nombre
                const specialMatch = nameWithoutExt.match(/(?:NO[_\s]*DOCUMENTO[_\s]*|DOCUMENTO[_\s]*NO[_\s]*)?([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s_]+?)(?:_?\d{6,8})?$/i);
                if (specialMatch && specialMatch[1]) {
                    let cleanName = specialMatch[1]
                        .trim()
                        .replace(/[_\s]+/g, '_')
                        .replace(/^_+|_+$/g, '')
                        .toUpperCase();
                    // Limpiar palabras comunes
                    cleanName = cleanName.replace(/\b(DOCUMENTOS?|CERTIFICADOS?|EVIDENCIAS?|ARCHIVOS?)\b/gi, '').trim();
                    if (cleanName.length > 3) {
                        data.nombreCompleto = cleanName;
                        console.log(`Nombre encontrado (sin documento al inicio): ${data.nombreCompleto}`);
                    } else {
                        console.log('Nombre de archivo sin documento corto');
                    }
                } else {
                    console.log('No se pudo extraer nombre de ninguna forma');
                }
            }
        }
    }

    console.log('Metadatos finales del nombre del archivo:', data);
    return data;
}

// extraccion de datos.
function extractMetadata(pdfText) {
    const data = {
        documento: null,
        nombreCompleto: null,
        fichaPDF: null,
    };

    // Buscar documento de múltiples formas
    let docMatch = null;

    docMatch = pdfText.match(/identificado\s+con\s+(?:número\s+de\s+)?(?:identificación|documento)[:\s]+(\d{8,12})/i);
    if (docMatch) {
        data.documento = docMatch[1];
        console.log(`Documento encontrado (patrón 1): ${data.documento}`);
    } else {
        docMatch = pdfText.match(/NUIP[:\s]+(\d{1,3}\.?\d{1,3}\.?\d{1,3}\.?\d{1,3})/i);
        if (docMatch) {
            data.documento = docMatch[1].replace(/\./g, '');
            console.log(`Documento encontrado (patrón NUIP con puntos): ${data.documento}`);
        } else {
            docMatch = pdfText.match(/(?:Cédula\s+de\s+Ciudadanía\s+No\.?|Cédula\s+No\.?|Documento|Cédula|Tarjeta\s+de\s+Identidad|NÚMERO\s+DE\s+DOCUMENTO|NÚMERO\s+DE\s+IDENTIFICACIÓN)[:\s]+(\d{8,12})/i);
            if (docMatch) {
                data.documento = docMatch[1];
                console.log(`Documento encontrado (patrón 3): ${data.documento}`);
            } else {
                docMatch = pdfText.match(/(?:CC|TI|NUIP|documento|DOCUMENTO)[:\s]+(\d{8,12})/i);
                if (docMatch) {
                    data.documento = docMatch[1];
                    console.log(`Documento encontrado (patrón 4): ${data.documento}`);
                } else {
                    docMatch = pdfText.match(/(?:número|numero|N°|Nº|No\.?)[:\s]*(?:de\s+)?(?:documento|identificación|identificacion)[:\s]+(\d{8,12})/i);
                    if (docMatch) {
                        data.documento = docMatch[1];
                        console.log(`Documento encontrado (patrón 5): ${data.documento}`);
                    } else {
                        docMatch = pdfText.match(/(?:documento|identificación|identificacion|cédula|cedula|CC|TI)[:\s]+(\d{1,3}\.?\d{1,3}\.?\d{1,3}\.?\d{1,3})/i);
                        if (docMatch) {
                            data.documento = docMatch[1].replace(/\./g, '');
                            console.log(`Documento encontrado (patrón 6 - con puntos): ${data.documento}`);
                        } else {
                            docMatch = pdfText.match(/(?:documento|identificación|identificacion|cédula|cedula|CC|TI|NUIP)[^0-9]{0,50}(\d{8,12})/i);
                            if (docMatch) {
                                data.documento = docMatch[1];
                                console.log(`Documento encontrado (patrón 7 - cerca de palabra clave): ${data.documento}`);
                            } else {
                                docMatch = pdfText.match(/(?:identificado|identificada)[^0-9]{0,50}(\d{8,12})/i);
                                if (docMatch) {
                                    data.documento = docMatch[1];
                                    console.log(`Documento encontrado (patrón 8 - después de identificado): ${data.documento}`);
                                } else {
                                    const allNumbers = pdfText.match(/\b(\d{8,12})\b/g);
                                    if (allNumbers) {
                                        // Filtrar números que probablemente sean documentos
                                        for (const num of allNumbers) {
                                            const numStr = num.replace(/\D/g, '');
                                            if (numStr.length >= 8 && numStr.length <= 12) {
                                                // Verificar contexto alrededor del número
                                                const numIndex = pdfText.indexOf(num);
                                                const context = pdfText.substring(Math.max(0, numIndex - 50), Math.min(pdfText.length, numIndex + 50));
                                                const contextLower = context.toLowerCase();
                                                
                                                // Si está cerca de palabras relacionadas con documento, es probable que sea un documento
                                                if (/documento|identificación|identificacion|cédula|cedula|cc|ti|nuip|identificado/i.test(contextLower)) {
                                                    data.documento = numStr;
                                                    console.log(`Documento encontrado (patrón 9 - búsqueda contextual): ${data.documento}`);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    if (!data.documento) {
                                        console.log('No se encontró documento en el contenido del PDF después de intentar todos los patrones');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Buscar nombre completo de múltiples formas
    let nameMatch = pdfText.match(/[Yy]o,?\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+?),\s+identificado/i);
    if (nameMatch && nameMatch[1]) {
        const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
        data.nombreCompleto = cleanName;
        console.log(`Nombre encontrado (patrón 1 - "Yo, ..."): ${data.nombreCompleto}`);
    } else {
        nameMatch = pdfText.match(/(?:Señora|Señor)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+?)\s+identificado/i);
        if (nameMatch && nameMatch[1]) {
            const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
            data.nombreCompleto = cleanName;
            console.log(`Nombre encontrado (patrón 2 - "Señor..."): ${data.nombreCompleto}`);
        } else {
            nameMatch = pdfText.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{8,}?),\s+identificado/i);
            if (nameMatch && nameMatch[1]) {
                const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
                data.nombreCompleto = cleanName;
                console.log(`Nombre encontrado (patrón 3 - "...identificado"): ${data.nombreCompleto}`);
            } else {
                nameMatch = pdfText.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{8,}?)\s+identificado\s+con/i);
                if (nameMatch && nameMatch[1]) {
                    const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
                    data.nombreCompleto = cleanName;
                    console.log(`Nombre encontrado (patrón 4 - "identificado con"): ${data.nombreCompleto}`);
                } else {
                    nameMatch = pdfText.match(/(?:Nombres|Apellidos|NOMBRE)[:\s]+([A-ZÁÉÍÓÚÑ\s]+)/i);
                    if (nameMatch && nameMatch[1]) {
                        const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
                        data.nombreCompleto = cleanName;
                        console.log(`Nombre encontrado (patrón 5 - "NOMBRE:"): ${data.nombreCompleto}`);
                    } else {
                        nameMatch = pdfText.match(/el\s+señor\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+?)\s+identificado/i);
                        if (nameMatch && nameMatch[1]) {
                            const cleanName = nameMatch[1].trim().replace(/\s+/g, '_').toUpperCase();
                            data.nombreCompleto = cleanName;
                            console.log(`Nombre encontrado (patrón 6 - "el señor"): ${data.nombreCompleto}`);
                        } else {
                            nameMatch = pdfText.match(/([A-ZÁÉÍÓÚÑ]{2,}\s+[A-ZÁÉÍÓÚÑ]{2,}\s+[A-ZÁÉÍÓÚÑ]{2,}\s+[A-ZÁÉÍÓÚÑ]{2,})/);
                            if (nameMatch && nameMatch[1]) {
                                const cleanName = nameMatch[1].trim().replace(/\s+/g, '_');
                                data.nombreCompleto = cleanName;
                                console.log(`Nombre encontrado (patrón 7 - mayúsculas): ${data.nombreCompleto}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Buscar ficha
    let fichaMatch = pdfText.match(/ficha\s+(?:número|N°|Nº|numero|No\.?)\s+(\d{6,7})/i);
    if (fichaMatch) {
        data.fichaPDF = fichaMatch[1];
        console.log(`Ficha encontrada (patrón 1 - "ficha número"): ${data.fichaPDF}`);
    } else {
        fichaMatch = pdfText.match(/perteneciente[^,]*ficha\s+(?:número|N°|Nº|numero|No\.?)?\s*(\d{6,10})/i);
        if (fichaMatch) {
            data.fichaPDF = fichaMatch[1];
            console.log(`Ficha encontrada (patrón 2 - "perteneciente...ficha"): ${data.fichaPDF}`);
        } else {
            fichaMatch = pdfText.match(/ficha[:\s]+(\d{6,10})/i);
            if (fichaMatch) {
                data.fichaPDF = fichaMatch[1];
                console.log(`Ficha encontrada (patrón 3 - "ficha:"): ${data.fichaPDF}`);
            } else {
                fichaMatch = pdfText.match(/de\s+la\s+ficha[:\s]+(\d{6,10})/i);
                if (fichaMatch) {
                    data.fichaPDF = fichaMatch[1];
                    console.log(`Ficha encontrada (patrón 4 - "de la ficha"): ${data.fichaPDF}`);
                } else {
                    fichaMatch = pdfText.match(/ficha[:\s]*(\d{6,10})(?:[,\s\.]|$)/i);
                    if (fichaMatch) {
                        data.fichaPDF = fichaMatch[1];
                        console.log(`Ficha encontrada (patrón 5 - "ficha" con puntuación): ${data.fichaPDF}`);
                    } else {
                        fichaMatch = pdfText.match(/ficha[^0-9]{0,30}(\d{6,10})/i);
                        if (fichaMatch) {
                            data.fichaPDF = fichaMatch[1];
                            console.log(`Ficha encontrada (patrón 6 - cerca de "ficha"): ${data.fichaPDF}`);
                        } else {
                            console.log('No se encontró ficha en el contenido del PDF');
                        }
                    }
                }
            }
        }
    }

    // Log para debugging
    console.log('Metadatos extraídos:', {
        documento: data.documento,
        nombreCompleto: data.nombreCompleto,
        fichaPDF: data.fichaPDF
    });

    return data;
}

/**
 * Procesa el buffer de un PDF para renombrarlo segun la nomenclatura.
 * @param {object} fileBuffer - Archivo buffer.
 * @param {string | undefined} fichaAsignada - Ficha digitada por el usuario.
 */
async function processPdfForRenaming(fileBuffer, fichaAsignada) {
    try {
        // Validar que el buffer existe y tiene contenido
        if (!fileBuffer || !fileBuffer.buffer || fileBuffer.buffer.length === 0) {
            throw new Error(`El archivo ${fileBuffer?.originalname || 'desconocido'} está vacío o corrupto.`);
        }

        // Validar que es un PDF
        const pdfHeader = fileBuffer.buffer.slice(0, 4).toString();
        if (pdfHeader !== '%PDF') {
            throw new Error(`El archivo ${fileBuffer.originalname} no parece ser un PDF válido.`);
        }

        // Extraer texto del PDF
        let data;
        let text = '';
        let metadata = {
            documento: null,
            nombreCompleto: null,
            fichaPDF: null,
        };
        
        let pdfReadSuccess = false;
        try {
            // Intentar leer el PDF
            console.log(`Intentando leer PDF con pdf-parse...`);
            console.log(`Tamaño del buffer: ${fileBuffer.buffer.length} bytes`);

            const pdfParseModule = require("pdf-parse");

            if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
                const parser = new pdfParseModule.PDFParse({ data: fileBuffer.buffer });
                // Obtener el texto usando getText()
                const textResult = await parser.getText();
                data = { text: textResult.text || textResult };
            } else if (typeof pdfParseModule === 'function') {
                data = await pdfParseModule(fileBuffer.buffer);
            } else {
                data = await pdfParseModule(fileBuffer.buffer);
            }
            
            text = data.text || '';
            pdfReadSuccess = true;
            
            console.log(`PDF leído exitosamente. Longitud del texto: ${text.length} caracteres`);
            // Log para debugging
            console.log(`Texto extraído (primeros 1000 caracteres):`, text.substring(0, 1000));

            text = text.replace(/\s+/g, ' ').trim();

            // Extraer metadatos del contenido del PDF
            metadata = extractMetadata(text);
            console.log('Metadatos extraídos del contenido del PDF:', metadata);
            
            // Si no se encontró documento
            if (!metadata.documento) {
                console.warn('No se encontró documento en el PDF. Buscando números de 8-12 dígitos en el texto...');
                const allLongNumbers = text.match(/\b\d{8,12}\b/g);
                if (allLongNumbers) {
                    console.log(`Números de 8-12 dígitos encontrados en el PDF:`, allLongNumbers);
                    // Mostrar contexto alrededor de cada número
                    allLongNumbers.forEach((num, idx) => {
                        const numIndex = text.indexOf(num);
                        if (numIndex >= 0) {
                            const context = text.substring(Math.max(0, numIndex - 100), Math.min(text.length, numIndex + 100));
                            console.log(`  Número ${idx + 1} (${num}): ...${context}...`);
                        }
                    });
                }
            }

            if (metadata.fichaPDF) {
                console.log(`FICHA ENCONTRADA EN EL PDF: ${metadata.fichaPDF} (esta tiene prioridad sobre la del nombre del archivo)`);
            }
        } catch (pdfError) {
            pdfReadSuccess = false;
            console.error('Error al leer PDF:', pdfError.message);
            console.error('Stack:', pdfError.stack);
            console.error('Tipo de pdfParse:', typeof pdfParse);
            // Si pdf-parse falla, intentar extraer del nombre del archivo como respaldo
            console.warn(`No se pudo leer el contenido del PDF ${fileBuffer.originalname}. Intentando extraer del nombre del archivo...`);
            console.warn(`Error de pdf-parse:`, pdfError.message);

            if (pdfError.message && pdfError.message.includes('password')) {
                throw new Error(`El PDF ${fileBuffer.originalname} está protegido con contraseña.`);
            }

            const metadataFromFilename = extractMetadataFromFilename(fileBuffer.originalname);
            console.log('Metadatos extraídos del nombre del archivo (cuando PDF falla):', metadataFromFilename);
            
            // Usar los metadatos del nombre del archivo
            metadata = {
                documento: metadataFromFilename.documento || null,
                nombreCompleto: metadataFromFilename.nombreCompleto || null,
                fichaPDF: metadataFromFilename.fichaPDF || null
            };
            
            console.log('Metadata después de extraer del nombre del archivo:', metadata);

            if (!metadata.fichaPDF && !fichaAsignada && !metadata.nombreCompleto) {
                throw new Error(`No se pudo leer el contenido del PDF ${fileBuffer.originalname} y el nombre del archivo no contiene suficiente información. Proporciona "fichaAsignada" o asegúrate de que el nombre del archivo incluya ficha y nombre.`);
            }
        }

        if (pdfReadSuccess && (!metadata.documento || !metadata.nombreCompleto)) {
            console.log('Información incompleta del PDF, intentando complementar con el nombre del archivo...');
            const metadataFromFilename = extractMetadataFromFilename(fileBuffer.originalname);
            
            // Combinar metadatos (el del PDF tiene prioridad)
            if (!metadata.documento && metadataFromFilename.documento) {
                metadata.documento = metadataFromFilename.documento;
            }
            if (!metadata.nombreCompleto && metadataFromFilename.nombreCompleto) {
                metadata.nombreCompleto = metadataFromFilename.nombreCompleto;
            }
            console.log(`Ficha del PDF (prioridad): ${metadata.fichaPDF || 'no encontrada'}`);
        }

        // Elige entre usar la ficha del PDF, la digitada, o la del nombre del archivo (en ese orden de prioridad)
        let fichaFinal = metadata.fichaPDF || fichaAsignada;

        if (!fichaFinal && !pdfReadSuccess) {
            const metadataFromFilename = extractMetadataFromFilename(fileBuffer.originalname);
            fichaFinal = metadataFromFilename.fichaPDF;
            if (fichaFinal) {
                console.log(`Usando ficha del nombre del archivo (PDF no se pudo leer): ${fichaFinal}`);
            }
        } else if (!fichaFinal && pdfReadSuccess) {
            console.log(`El PDF se leyó pero no se encontró ficha en el contenido`);
        } else if (fichaFinal && pdfReadSuccess) {
            console.log(`Usando ficha del contenido del PDF: ${fichaFinal}`);
        }

        if (!fichaFinal) {
            throw new Error(`El archivo ${fileBuffer.originalname} no contiene Ficha en el texto y no se asignó una Ficha global. Asegúrate de proporcionar "fichaAsignada" o que el PDF contenga el texto "Ficha: [número]".`);
        }

        // Asegurar que los valores no sean null o undefined
        const documento = (metadata.documento && String(metadata.documento).trim()) || "NO_DOCUMENTO";
        const nombreCompleto = (metadata.nombreCompleto && String(metadata.nombreCompleto).trim()) || "NO_NOMBRE";
        const ficha = String(fichaFinal).trim();

        console.log('Valores finales para el nombre:', {
            documento,
            nombreCompleto,
            ficha
        });

        // nomenclatura
        const nombreBase = [
            documento,
            nombreCompleto,
            ficha
        ].join("_");

        const extension = fileBuffer.originalname.split(".").pop() || "pdf";
        const nuevoNombrecompleto = `${nombreBase}.${extension}`;

        console.log(`Nombre final generado: ${nuevoNombrecompleto}`);

        return {
            buffer: fileBuffer.buffer,
            fichaFinal: ficha,
            nuevoNombreCompleto: nuevoNombrecompleto,
            originalName: fileBuffer.originalname
        };
    } catch (error) {
        console.error(`Error procesando archivo ${fileBuffer?.originalname || 'desconocido'}:`, error.message);
        throw error;
    }
}

module.exports = {
    processPdfForRenaming
};