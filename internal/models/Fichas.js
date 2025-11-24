const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    return sequelize.define("FICHAS", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        codigo_ficha: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        nombre_programa: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        trimestre_actual: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        centro_formacion: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },

    },  {
        tableName: "FICHAS",
        timestamps: false,
        freezeTableName: true,
    });
}