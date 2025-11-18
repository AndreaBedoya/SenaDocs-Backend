const db = require("../models");
const {EVALUACIONES, USUARIOS} = db;

class EvaluacionRepository {
    /**
     * Registra evaluacion.
     * @param {object} evaluationData
     */
    async create(evaluationData) {
        return EVALUACIONES.create(evaluationData);
    }

    /**
     * Obtiene las evaluaciones de un documento por id y al evaluador.
     * @param {number} documentId
     */
    async findByDocumentId(documentId) {
        return EVALUACIONES.findAll({
            where: {documentId: documentId},
            include: [{ model: USUARIOS, as: "evaluador", attributes: ["nombre", "apellido"] }],
            order: [["createdAt", "DESC"]]
        });
    }

    /**
     * Actualiza estado evaluacion.
     * @param {number} id
     * @param {object} updateData - Datos a actualizar.
     */
    async update(id,updateData) {
        return EVALUACIONES.update(updateData, { where: {id: id} });
    }
}

module.exports = new EvaluacionRepository();