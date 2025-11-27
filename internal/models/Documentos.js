const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    return sequelize.define("DOCUMENTOS", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ficha_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo_documento: {
            type: DataTypes.ENUM("JUICIO_EVALUATIVO", "NOVEDAD_ACADEMICA"),
            allowNull: false,
        },
        nombre_original_archivo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        nombre_final_generado: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        documento_aprendiz: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        porcentaje_total: {
            type: DataTypes.DECIMAL(5,2),
            allowNull: true,
        },
        observaciones_log: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

    }, {
        tableName: "DOCUMENTOS",
        timestamps: true,
        freezeTableName: true,

    });

}