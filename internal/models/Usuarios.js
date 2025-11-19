const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    return sequelize.define("USUARIOS", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        documento_identidad: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    }, {
        tableName: "USUARIOS",
        timestamps: true,
        freezeTableName: true,
    });

};