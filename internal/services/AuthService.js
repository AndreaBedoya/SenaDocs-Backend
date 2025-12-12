const bcrypt = require("bcryptjs");
const UserRepository = require("../repository/UserRepository");
const jwtUtils = require("../utils/JwtUtils");
const crypto = require("crypto");
const EmailService = require("../services/EmailService");

class AuthService {
  async register({
    nombre,
    apellido,
    email,
    password,
    documento,
    centro_formacion,
    ciudad,
    telefono,
    fecha_nacimiento,
    cargo,
    funciones_trabajo,
    rol_id,
    foto
  }) {
    if (await UserRepository.findByEmail(email)) {
      throw new Error("El email ya está registrado");
    }
    if (await UserRepository.findByDocument(documento)) {
      throw new Error("El documento ya está registrado");
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      nombre,
      apellido,
      email,
      password: hashedPassword,
      documento,
      centro_formacion,
      ciudad,
      telefono,
      fecha_nacimiento,
      cargo,
      funciones_trabajo,
      rol_id,
      foto
    };

    const newUser = await UserRepository.create(userData);

    return {
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        documento: newUser.documento,
        email: newUser.email,
        ciudad: newUser.ciudad,
        telefono: newUser.telefono,
        cargo: newUser.cargo,
        funciones_trabajo: newUser.funciones_trabajo,
        centro_formacion: newUser.centro_formacion,
        fecha_nacimiento: newUser.fecha_nacimiento,
        rol_id: newUser.rol_id,
        foto: newUser.foto
      }
    };
  }

  async login(documento, password) {
    const user = await UserRepository.findByDocument(documento);
    if (!user) {
      throw new Error("Credenciales inválidas.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Credenciales inválidas.");
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
        apellido: user.apellido,
        documento: user.documento,
        email: user.email,
        ciudad: user.ciudad,
        telefono: user.telefono,
        cargo: user.cargo,
        funciones_trabajo: user.funciones_trabajo,
        centro_formacion: user.centro_formacion,
        fecha_nacimiento: user.fecha_nacimiento,
        rol_id: user.rol_id,
        foto: user.foto
      }
    };
  }

  async requestPasswordReset(email) {
    try {
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return {
          success: true,
          message: "Si el email existe, recibirás un enlace de recuperación."
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresIn = parseInt(process.env.RESET_PASSWORD_EXPIRES) || 60;
      const expirationDate = new Date(Date.now() + expiresIn * 60 * 1000);

      await user.update({
        reset_password_token: resetToken,
        reset_password_expires: expirationDate,
      });

      await EmailService.sendPasswordResetEmail(user, resetToken);

      return {
        success: true,
        message: "Si el email existe recibirás un enlace de recuperación."
      };
    } catch (error) {
      console.error("Error en requestPasswordReset", error);
      throw error;
    }
  }

  async verifyResetToken(token) {
    try {
      const user = await UserRepository.findByTokenPassword(token);
      if (!user) {
        throw new Error("Token inválido o expirado.");
      }

      const now = new Date();
      if (now > user.reset_password_expires) {
        await user.update({
          reset_password_token: null,
          reset_password_expires: null,
        });
        throw new Error("Token expirado, solicita uno nuevo");
      }

      return {
        success: true,
        email: user.email,
        message: "Token válido"
      };
    } catch (error) {
      console.error("Error en verifyResetToken", error);
      throw error;
    }
  }

  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const user = await UserRepository.findByTokenPassword(token);
      if (!user) {
        throw new Error("Token inválido o expirado");
      }

      const now = new Date();
      if (now > user.reset_password_expires) {
        await user.update({
          reset_password_token: null,
          reset_password_expires: null,
        });
        throw new Error("Token expirado, solicita uno nuevo");
      }

      if (!newPassword || !confirmPassword) {
        throw new Error("La nueva contraseña y su confirmación son requeridas");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await user.update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      });

      await EmailService.sendPasswordChangedEmail(user);

      return {
        success: true,
        message: "Contraseña actualizada con éxito",
      };
    } catch (error) {
      console.log("Error en resetPassword", error);
      throw error;
    }
  }
}

module.exports = new AuthService();
