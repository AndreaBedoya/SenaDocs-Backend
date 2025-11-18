const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    const EVALUACIONES = sequelize.define("EVALUACIONES", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        puntuacion_originalidad: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        puntuacion_novedad: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        puntuacion_total: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        similitud_detectada: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        fuentes_similares: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metodo_evaluacion: {
            type: DataTypes.ENUM("AUTOMATICO", "MANUAL", "MIXTO"),
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM("EN_PROCESO", "COMPLETADO", "ERROR"),
            allowNull: false,
            defaultValue: "EN_PROCESO",
        },
        fecha_evaluacion: {
            type: DataTypes.DATE,
            allowNull: false,
        }

    }, {
        tableName: "EVALUACIONES",
        timestamps: true,
        freezeTableName: true,

    });

    return EVALUACIONES;

}