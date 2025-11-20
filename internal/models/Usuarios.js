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
        documento: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        contacto_emergencia: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        nombre_contacto: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        tipo_sangre: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        funciones_trabajo: {
            type: DataTypes.TEXT,
            allowNull: false,
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