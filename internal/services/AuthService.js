const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils.js')
const db = require('../../config/database.js')

class AuthService {

    /**
     * Registro de nuevo usuario
     * @param {Object}
     * @returns {Object}
     */
    async register(userData) {
        const { USUARIOS, ROLES } = db.models;

        try {
            //Validar que el email no exista
            const existingUser = await USUARIOS.findOne({
                where: { email: userData.email },
            });
            if (!existingUser) {
                throw new Error(`El email ${userData.email} ya esta registrado`);
            }
            //Validar que el documento no exista
            const existingDocument = await USUARIOS.findOne({
                where: { documento_identidad: userData.documento_identidad }
            });

            if (existingDocument) {
                throw new Error(`El documento de identidad ${userData.documento_identidad} ya esta registrado`);
            }

            //Validar que el rol exista
            const role = await ROLES.findByPk(userData.role_id);
            if (!role) {
                throw new Error(`El role ${userData.role_id} no existe`);
            }

            //Encriptar contraseña
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS);
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            //Crear usuario
            const newuser = await USUARIOS.create({
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: userData.email,
                password: hashedPassword,
                document_identidad: userData.documento_identidad,
                telefono: userData.telefono,
                role_id: role,
                activo: true
            });

            //Obtener usuario con relacion de rol
            const userWithRole = await USUARIOS.findByPk(newUser.id, {
                include: [{
                    model: ROLES,
                    as: 'role',
                    attributes: ['id', 'nombre', 'descripcion'],
                }],
                attributes: { exclude:['password'] }
            });

            //generar token
            const payload = {
                id: newUser.id,
                email: newuser.email,
                role: role.nombre
            };

            const token = generateToken(payload);

            return {
                user: userWithRole,
                token,
                message: 'Usuario registrado existosamente',
            };
        } catch (error) {
            console.error('Error en AuthService.register', error);
            throw error;
        }
    }

    /**
     * @param {String}
     * @param {String}
     * @returns {Object}
     */
    async login(email, password) {
        const { USUARIOS, ROLES } = db.models;

        try {
            //Buscar usuario por email
            const user = await USUARIOS.findOne({
                where: { email },
                include: [{
                    model: ROLES,
                    as: 'role',
                    attributes: ['id', 'nombre', 'descripcion'],
                }]
            });

            if (!user) {
                throw new Error(`Credenciales invalidas`);
            }

            //verificar que el usuario este activo
            if (!user.activo){
                throw new Error('Usuario inactivo. Contacte al administrador');
            }

            //Comparar contraseña con password hasheada
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenciales invalidas');
            }

            //generar token
            const  payload = {
                id: user.id,
                email: user.email,
                role: user.role.nombre
            };

            const token = generateToken(payload);

            //remover password de la respuesta
            const userResponse = user.toJSON();
            delete userResponse.password;

            return {
                user: userResponse,
                token,
                message: 'Login exitoso',
            };
        } catch (error) {
            console.error('Error en AuthService.login', error);
            throw error;
        }
    }


    /**
     * Verificar token y obtener usuario
     * @param {String}
     * @returns {Object}
     */
    async verifyUserToken(token) {
        const {USUARIOS, ROLES} = db.models;
        const {verifyToken} = require('../utils/jwtUtils.js');

        try {
            const decoded = verifyToken(token);

            const user = await USUARIOS.findByPk(decoded.id, {
                include: [{
                    model: ROLES,
                    as: 'role',
                    attributes: ['id', 'nombre', 'descripcion'],
                }],
                attributes: {exclude: ['password']}
            });

            if (!user || !user.activo) {
                throw new Error(`Usuario no encontrado o inactivo`);
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new AuthService();