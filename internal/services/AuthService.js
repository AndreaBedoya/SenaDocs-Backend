// Archivo: internal/services/AuthService.js

const bcrypt = require('bcryptjs'); // Usamos bcryptjs para consistencia si es lo que usas
const { generateToken } = require('../utils/JwtUtils.js');

// >>>>> MODIFICACIÓN CLAVE: Usamos el Repositorio <<<<<
const UserRepository = require('../repository/UserRepository');
const TrazabilidadRepository = require('../repository/TrazabilidadRepository');
const RoleRepository = require('../repository/RoleRepository');

class AuthService {

    // ==========================================
    // 1. REGISTRO DE NUEVO USUARIO
    // ==========================================
    async register(userData) {
        try {
            // 1. Validar que el email no exista (Llama a Repository)
            let existingUser = await UserRepository.findByEmail(userData.email);
            if (existingUser) {
                // Corregido: Error más específico
                throw new Error(`El email ${userData.email} ya esta registrado`);
            }

            // 2. Validar que el documento no exista (Llama a Repository)
            existingUser = await UserRepository.findByDocument(userData.documento_identidad); // *Asumimos esta función existe en UserRepository*
            if (existingUser) {
                throw new Error(`El documento de identidad ${userData.documento_identidad} ya esta registrado`);
            }

            // 3. Validar que el rol exista
            let role = await RoleRepository.findById(userData.role_id);
            if (!role) {
                // Si no se provee rol, asumimos 'USUARIO' (ID: 2)
                role = await RoleRepository.findByName('USUARIO');
                userData.role_id = role ? role.id : 2;
            }

            // 4. Encriptar contraseña
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || 10);
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // 5. Crear usuario (Llama a Repository)
            const newUser = await UserRepository.create({
                ...userData,
                password: hashedPassword,
                // Si tienes un campo 'activo', debe ir aquí
                activo: true,
            });

            // 6. Obtener usuario con relación de rol y generar token
            const userWithRole = await UserRepository.findByIdWithRole(newUser.id); // *Asumimos esta función existe en UserRepository*

            const payload = {
                id: newUser.id,
                email: newUser.email,
                role: userWithRole.role.nombre
            };
            const token = generateToken(payload);

            return {
                user: userWithRole,
                token,
                message: 'Usuario registrado exitosamente',
            };
        } catch (error) {
            console.error('Error en AuthService.register', error);
            throw error;
        }
    }

    // ==========================================
    // 2. INICIO DE SESIÓN
    // ==========================================
    async login(email, password) {
        try {
            // Buscar usuario por email (Llama a Repository)
            const user = await UserRepository.findByEmail(email);

            if (!user) {
                throw new Error(`Credenciales invalidas`);
            }

            // verificar que el usuario este activo
            if (!user.activo){
                throw new Error('Usuario inactivo. Contacte al administrador');
            }

            // Comparar contraseña con password hasheada
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenciales invalidas');
            }

            // Registro de Trazabilidad (Llama a Repository de Trazabilidad)
            // Lógica de Trazabilidad omitida aquí para mantener el foco, pero debe ir en el Controller o aquí.

            // generar token
            const  payload = {
                id: user.id,
                email: user.email,
                role: user.role.nombre
            };

            const token = generateToken(payload);

            // remover password de la respuesta
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

    // ==========================================
    // 3. VERIFICAR TOKEN
    // ==========================================
    async verifyUserToken(token) {
        try {
            const { verifyToken } = require('../utils/JwtUtils.js'); // Importación local
            const decoded = verifyToken(token);

            // Buscar usuario por ID con rol (Llama a Repository)
            const user = await UserRepository.findByIdWithRole(decoded.id);

            if (!user || !user.activo) {
                throw new Error(`Usuario no encontrado o inactivo`);
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    // ==========================================
    // 4. RECUPERACIÓN DE CONTRASEÑA (Pendiente de implementar)
    // ==========================================
    // DEBES AÑADIR LAS FUNCIONES DE requestPasswordReset() y resetPassword() aquí.
}
module.exports = new AuthService();