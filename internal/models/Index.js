const dbConfig = require("../../config/Database");
const { Sequelize } = require('sequelize');
const sequelize = dbConfig.sequelize;
const db = {};

db.ROLES = require("./Roles")(sequelize);
db.USUARIOS = require("./Usuarios")(sequelize);
db.DOCUMENTOS = require("./Documentos")(sequelize);
db.TRAZABILIDAD_SESIONES = require("./TrazabilidadSesiones")(sequelize);
db.FICHAS = require("./FICHAS")(sequelize);

db.FICHAS.hasMany(db.DOCUMENTOS, {
    foreignKey: "ficha_id",
    as: "logsDeDocumentos",
    onDelete: "CASCADE",
});
db.DOCUMENTOS.belongsTo(db.FICHAS, {
    foreignKey: "ficha_id",
    as: "fichaAsociada"
})

db.USUARIOS.belongsTo(db.ROLES, {
    foreignKey: "rol_id",
    as: "rol"
});
db.ROLES.hasMany(db.USUARIOS, {
    foreignKey: "rol_id",
    as: "usuarios",
});

db.DOCUMENTOS.belongsTo(db.USUARIOS, {
    foreignKey: "usuario_id",
    as: "procesadoPor"
});
db.USUARIOS.hasMany(db.DOCUMENTOS, {
    foreignKey: "usuario_id",
    as: "logsDeProcesos"
});

db.TRAZABILIDAD_SESIONES.belongsTo(db.USUARIOS, {
    foreignKey: "usuario_id",
    as: "sesionUsuario",
});
db.USUARIOS.hasMany(db.TRAZABILIDAD_SESIONES, {
    foreignKey: "usuario_id",
    as: "historialAcceso",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
