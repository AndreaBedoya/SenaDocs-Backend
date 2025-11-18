const db = require(sequelize);
const { CATEGORIAS } = db;

class CategoriaRepository {
    /**
     * Obtiene las categorias activas.
     * @returns {Array<object>}
     */
    async findAllActive() {
        return CATEGORIAS.findAll({
            where: { activo: true },
            order: [['nombre', 'ASC']]
        });
    }

    /**
     * Crea una nueva categoria.
     * @param {object} categoryData
     */
    async create(categoryData) {
        return CATEGORIAS.create(categoryData);
    }

    /**
     * Busca por id.
     * @param {number} id
     */
    async findById(id) {
        return CATEGORIAS.findByPk(id);
    }

    /**
     * Cambia el estado a false
     * @param {number} id
     */
    async deactivate(id) {
        return CATEGORIAS.update(
            { activo: false },
            { where: { id: id } },
        );
    }
}

module.exports = new CategoriaRepository();