import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/registro", async (req, res) => {
  const { identificacion, nombre_completo, correo, contraseña } = req.body;

  try {
    const resultado = await pool.query(
      "INSERT INTO usuarios (identificacion, nombre_completo, correo, contraseña) VALUES ($1, $2, $3, $4) RETURNING *",
      [identificacion, nombre_completo, correo, contraseña]
    );
    res.status(201).json({ mensaje: "Usuario registrado", usuario: resultado.rows[0] });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

export default router;
