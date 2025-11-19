const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    return sequelize.define("ROLES", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isIn: [["ADMIN", "INSTRUCTOR", "USUARIO"]]
            }
        },
        descripcion: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },

    }, {
        tableName: "ROLES",
        timestamps: true,
        freezeTableName: true,
    });

};