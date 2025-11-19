const dbConfig = require("../../config/Database");
const { Sequelize } = require('sequelize');
const sequelize = dbConfig.sequelize;
const db = {};

db.ROLES = require("./Roles")(sequelize);
db.USUARIOS = require("./Usuarios")(sequelize);
db.CATEGORIAS = require("./Categorias")(sequelize);
db.DOCUMENTOS = require("./Documentos")(sequelize);
db.EVALUACIONES = require("./Evaluaciones")(sequelize);
db.TRAZABILIDAD_SESIONES = require("./TrazabilidadSesiones")(sequelize);
db.NOVEDADES_ACADEMICAS = require("./NovedadesAcademicas")(sequelize);

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
    as: "autor",
});
db.USUARIOS.hasMany(db.DOCUMENTOS, {
    foreignKey: "usuario_id",
    as: "documentosSubidos",
});

db.DOCUMENTOS.belongsTo(db.CATEGORIAS, {
    foreignKey: "categoria_id",
    as: "categoria",
});
db.CATEGORIAS.hasMany(db.DOCUMENTOS, {
    foreignKey: "categoria_id",
    as: "documentos",
});

db.EVALUACIONES.belongsTo(db.DOCUMENTOS, {
    foreignKey: "documento_id",
    as: "documentos",
});
db.DOCUMENTOS.hasMany(db.EVALUACIONES, {
    foreignKey: "documento_id",
    as: "evaluaciones",
});

db.EVALUACIONES.belongsTo(db.USUARIOS, {
    foreignKey: "evaluador_id",
    as: "evaluador",
});
db.USUARIOS.hasMany(db.EVALUACIONES, {
    foreignKey: "evaluador_id",
    as: "evaluacionesHechas",
});

db.TRAZABILIDAD_SESIONES.belongsTo(db.USUARIOS, {
    foreignKey: "usuario_id",
    as: "sesionUsuario",
});
db.USUARIOS.hasMany(db.TRAZABILIDAD_SESIONES, {
    foreignKey: "usuario_id",
    as: "historialAcceso",
});

db.NOVEDADES_ACADEMICAS.belongsTo(db.DOCUMENTOS, {
    foreignKey: "documento_id",
    as: "documentoRelacionado",
});
db.DOCUMENTOS.hasMany(db.NOVEDADES_ACADEMICAS, {
    foreignKey: "documento_id",
    as: "novedadesAcademicas",
});

db.NOVEDADES_ACADEMICAS.belongsTo(db.USUARIOS, {
    foreignKey: "reportado_por_id",
    as: "reportador",
});
db.USUARIOS.hasMany(db.NOVEDADES_ACADEMICAS, {
    foreignKey: "reportado_por_id",
    as: "novedadesReportes",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
