import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

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

    // Si todo está bien, enviar respuesta
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        identificacion: usuario.identificacion,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
