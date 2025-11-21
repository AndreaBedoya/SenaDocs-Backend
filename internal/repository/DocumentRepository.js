const db = require("../models");
const {DOCUMENTOS, USUARIOS} = db;

class DocumentRepository {
    /**
     * Crea un registro de documento.
     * @param {object} documentData - Metadatos del archivo y FKs.
     * @returns {object}
     */
    async create(documentData){
        return DOCUMENTOS.create(documentData);
    }

    /**
     * Busca documento por id incluye detalles.
     * @param {number} id
     * @returns {object}
     */
    async findById(id){
        return DOCUMENTOS.findByPk(id, {
            include: [
                { model: USUARIOS, as: "autor", attributes: ["id", "nombre", "apellido", "documento_identidad"] },
                { model: CATEGORIAS, as: "categoria" },
            ],
        });
    }

    /**
     * Actualiza visitas.
     * @param {number} id
     */
    async incrementVisits(id) {
        return DOCUMENTOS.increment("visitas", { by: 1, where: { id: id} });
    }
}

module.exports = new DocumentRepository();
