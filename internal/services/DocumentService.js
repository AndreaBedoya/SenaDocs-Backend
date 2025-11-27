const pdf = require("pdf-parse");

// extraccion de datos.
function extractMetadata(pdfText) {
    const data = {
        documento: null,
        nombreCompleto: null,
        fichaPDF: null,
    };

    const docMatch = pdfText.match(/(Documento|Cédula|Tarjeta)[:\s](\d{8,12})/);
    if (docMatch) data.documento = docMatch[1];

    const namePattern = /(Señora|Señor)\s+([A-Z\s]+?)\s+identificado/i;
    const nameMatch = pdfText.match(namePattern);

    if (nameMatch && nameMatch[2]) {
        // Reemplazamos los espacios por _
        const cleanName = nameMatch[2].trim().replace(/\s+/g, '_');
        data.nombreCompleto = cleanName;
    }

    const fichaMatch = pdfText.match(/Ficha[:\s](\d{7,})/);
    if (fichaMatch) data.fichaPDF = fichaMatch[1];

    return data;
}

/**
 * Procesa el buffer de un PDF para renombrarlo segun la nomenclatura.
 * @param {object} fileBuffer - Archivo buffer.
 * @param {string | undefined} fichaAsignada - Ficha digitada por el usuario.
 */
async function processPdfForRenaming(fileBuffer, fichaAsignada) {
    try {
        // Extraer texto.
        const data = await pdf(fileBuffer.buffer);
        const text = data.text;

        // Extraer metadatos.
        const metadata = extractMetadata(text);

        // Elige entre usar la ficha del PDF o la digitada
        const fichaFinal = metadata.fichaPDF || fichaAsignada;

        if (!fichaFinal) {
            throw new Error(`El archivo ${fileBuffer.originalname} no contiene Ficha y no se asigno una Ficha global.`);
        }

        // nomeclantura
        const nombreBase = [
            metadata.documento || "NO_DOCUMENTO",
            metadata.nombreCompleto || "NO_NOMBRE",
            fichaFinal
        ].join("_");

        const extension = fileBuffer.originalname.split(".").pop();
        const nuevoNombrecompleto = `${nombreBase}.${extension}`;

        return {
            buffer: fileBuffer.buffer,
            fichaFinal: fichaFinal,
            nuevoNombrecompleto: nuevoNombrecompleto,
            originalName: fileBuffer.originalname
        };
    } catch (error) {
        console.error(`Error procesando archivo ${fileBuffer.originalname}:`, error);
        throw new Error(`Error al leer PDF de ${fileBuffer.originalname}.`);
    }
}

module.exports = {
    processPdfForRenaming
};