const { DataTypes, TEXT} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("CALCULOS_REPORTES", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        documento_origen_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ficha_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_elementos: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        resultados_json: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        fecha_calculo: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    },  {
        tableName: "CALCULOS_REPORTES",
        timestamps: false,
        freezeTableName: true,
    });
}