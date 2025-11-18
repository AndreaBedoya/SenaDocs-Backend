const db = require("../models");
const {NOVEDADES_ACADEMICAS, USUARIOS} = db;

class NovedadRepository {
    /**
     * Crea una novedad.
     * @param {object} noveltyData
     */
    async create(noveltyData) {
        return NOVEDADES_ACADEMICAS.create(noveltyData);
    }

    /**
     * Obtiene las novedades de un documento.
     * @param {number} documentId
     */
    async findDocumentId(documentId) {
        return NOVEDADES_ACADEMICAS.findAll({
            where: {documentId: documentId},
            include: [{ model: USUARIOS, as: "reportador", attributes: ["nombre", "apellido", "email"] }],
            order: [["createdAt", "ASC"]]
        });
    }

    /**
     * Marca resuelta una novedad.
     * @param {number} id
     */
    async markAsResolved(id) {
        return NOVEDADES_ACADEMICAS.update(
            { estado: "RESUELTO" },
            { where: { id: id } }
        );
    }
}

module.exports = new NovedadRepository();