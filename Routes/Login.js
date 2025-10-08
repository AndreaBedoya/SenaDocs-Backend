import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { identificacion, contrasena } = req.body;

  // Validación de campos
  if (!identificacion || !contrasena) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Buscar usuario por identificación
    const resultado = await pool.query(
      "SELECT * FROM registro_usuarios WHERE identificacion = $1",
      [identificacion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no registrado" });
    }

    const usuario = resultado.rows[0];

    // Comparar contraseñas
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { identificacion: usuario.identificacion },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Enviar respuesta con token y datos del usuario
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        identificacion: usuario.identificacion,
        nombre_completo: usuario.nombre_completo
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
