module.exports = async function initRoles(sequelize) {
    try {
        const ROLES = sequelize.models.ROLES;

        if (!ROLES) {
            console.error("Modelo ROLES no encontrado :c");
            return;
        }

        const DEFAULT_ROLES = [
            { nombre: "ADMIN", descripcion: "Administrador del sistema" },
            { nombre: "USUARIO", descripcion: "Usuario general" },
            { nombre: "INSTRUCTOR", descripcion: "Instructor sena" }
        ];

        for (const role of DEFAULT_ROLES) {
            await ROLES.findOrCreate({
                where: { nombre: role.nombre },
                defaults: role
            });
        }

        console.log("Roles creados correctamente.");
    } catch (err) {
        console.error("Error creando roles:", err.message);
    }
};
