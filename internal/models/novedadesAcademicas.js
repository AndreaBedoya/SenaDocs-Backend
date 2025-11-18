const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    const NOVEDADES_ACADEMICAS = sequelize.define("NOVEDADES_ACADEMICAS", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tipo_novedad: {
            type: DataTypes.ENUM("MEJORA", "ERROR", "COMPLEMENTO"),
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "RESUELTO"),
            allowNull: false,
            defaultValue: "PENDIENTE",
        }

    },  {
        tableName: "NOVEDADES_ACADEMICAS",
        timestamps: true,
        freezeTableName: true,
    });

    return NOVEDADES_ACADEMICAS;

}