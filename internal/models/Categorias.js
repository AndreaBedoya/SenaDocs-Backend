const { DataTypes } = require ("sequelize")

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    return sequelize.define("CATEGORIAS", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        icono: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

    }, {
        tableName: "CATEGORIAS",
        timestamps: true,
        freezeTableName: true,
    });

};