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
        telefono,
        contacto_emergencia,
        nombre_contacto,
        tipo_sangre,
        fecha_nacimiento,
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
            telefono,
            contacto_emergencia,
            nombre_contacto,
            tipo_sangre,
            fecha_nacimiento,
            funciones_trabajo,
            rol_id
        };

        const newUser = await UserRepository.create(userData);

        const token = jwtUtils.generateToken({
            id: newUser.id,
            email: newUser.email,
            role: newUser.rol_id,
        });

        return {
            token,
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol_id: newUser.rol_id,
            }
        };
    }

    //async login ()

}

module.exports = new AuthService();