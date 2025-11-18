const { DataTypes } = require('sequelize');

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    TRAZABILIDAD_SESIONES = sequelize.define("TRAZABILIDAD_SESIONES", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_cierre: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        dispositivo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }

    }, {
        tableName: 'TRAZABILIDAD_SESIONES',
        timestamps: true,
        freezeTableName: true,
    });

    return TRAZABILIDAD_SESIONES;

}