const { DataTypes } = require("sequelize");

/**
 * @param {object} sequelize
 * @returns {object}
 */

module.exports = (sequelize) => {
    const DOCUMENTOS = sequelize.define("DOCUMENTOS", {
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
        nombre_archivo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ruta_archivo: {
            type: DataTypes.STRING(500),
            unique: true,
            allowNull: false,
        },
        tipo_mime: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        tamaño_bytes: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        palabras_clave: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        año_publicacion: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        autores: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        estado: {
            type: DataTypes.ENUM("PENDIENTE", "APROBADO", "RECHAZADO", "REVISION"),
            allowNull: false,
            defaultValue: "PENDIENTE",
        },
        publico: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        descargas: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        visitas: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }

    },  {
        tableName: "DOCUMENTOS",
        timestamps: true,
        freezeTableName: true,

    });

    return DOCUMENTOS;

}