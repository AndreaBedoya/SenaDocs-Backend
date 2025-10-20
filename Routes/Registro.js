import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/registro", async (req, res) => {
  const { identificacion, nombre_completo, correo, contrasena, ciudad, nacimiento, sangre, telefono, foto, cargo, funciones, nombre_emergencia, numero_emergencia } = req.body;

  try {
    // Validar campos obligatorios
    if (!identificacion || !nombre_completo || !correo || !contrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si ya existe un usuario con esa identificación
    const existe = await pool.query(
      "SELECT * FROM registro_usuarios WHERE identificacion = $1",
      [identificacion]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "Ya existe un usuario con esa identificación" });
    }

    // Encriptar la contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar el nuevo usuario
    const resultado = await pool.query(
      "INSERT INTO registro_usuarios (identificacion, nombre_completo, correo, contrasena, ciudad, nacimiento, sangre, telefono, foto, cargo, funciones, nombre_emergencia, numero_emergencia ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [identificacion, nombre_completo, correo, hash, ciudad, nacimiento, sangre, telefono, foto, cargo, funciones, nombre_emergencia, numero_emergencia]
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: resultado.rows[0]
    });
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

export default router;

