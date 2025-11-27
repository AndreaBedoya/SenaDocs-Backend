const db = require("../models");
const FICHAS = db;

class FichasRepository {
    /**
     * Busca llave primaria
     *@param {number} id
     *@returns {object}
     */
    async findById(id) {
        return FICHAS.findByPk(id);
    }

    /**
     * Busca codigo de ficha
     * @param {string} ficha
     * @returns {object}
     */
    async findByFicha(ficha) {
        return FICHAS.findOne({
            where: {codigo_ficha: ficha}
        });
    }

    /**
     * get all fichas
     * @returns {objects}
     */
    async findAll() {
        return FICHAS.findAll();
    }
}

module.exports = new FichasRepository();