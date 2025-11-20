const bcrypt = require("bcryptjs");
const UserRepository = require("../repository/UserRepository");
const jwtUtils = require("../utils/JwtUtils");

class AuthService {

    async register({
        nombre,
        apellido,
        email,
        password,
        documento,
        ciudad,
        telefono,
        contacto_emergencia,
        nombre_contacto,
        tipo_sangre,
        fecha_nacimiento,
        cargo,
        funciones_trabajo,
        rol_id
    }){
        if (await UserRepository.findByEmail(email)) {
            throw new Error("El email ya esta registrado");
        }
        if (await UserRepository.findByDocument(documento)) {
            throw new Error("El documento ya esta registrado");
        }
        // hash
        const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userData = {
            nombre,
            apellido,
            email,
            password: hashedPassword,
            documento,
            ciudad,
            telefono,
            contacto_emergencia,
            nombre_contacto,
            tipo_sangre,
            fecha_nacimiento,
            cargo,
            funciones_trabajo,
            rol_id
        };

        const newUser = await UserRepository.create(userData);

        return {
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                rol_id: newUser.rol_id,
            }
        };
    }

    /**
     * @param {string} documento
     * @param {string} password
     * @returns {object}
     */
    async login (documento, password) {

        const user = await UserRepository.findByDocument(documento);
        if (!user) {
            throw new Error("Credenciales invalidas.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Credenciales invalidas.")
        }

        const token = jwtUtils.generateToken({
            id: user.id,
            email: user.email,
            rol: user.rol_id,
        });

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol_id: user.rol_id,
            }
        };

    }

}

module.exports = new AuthService();