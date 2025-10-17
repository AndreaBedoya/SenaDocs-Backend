import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ Ruta para actualizar perfil directamente en registro_usuarios
router.put("/:identificacion", async (req, res) => {
  const { identificacion } = req.params;
  const {
    nombre_completo,
    ciudad,
    nacimiento,
    funciones,
    correo,
    cargo,
    sangre,
    telefono,
    nombre_emergencia,
    numero_emergencia,
    foto
  } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE registro_usuarios SET
        nombre_completo = $1,
        ciudad = $2,
        nacimiento = $3,
        funciones = $4,
        correo = $5,
        cargo = $6,
        sangre = $7,
        telefono = $8,
        nombre_emergencia = $9,
        numero_emergencia = $10,
        foto = $11
      WHERE identificacion = $12
      RETURNING *`,
      [
        nombre_completo,
        ciudad,
        nacimiento,
        funciones,
        correo,
        cargo,
        sangre,
        telefono,
        nombre_emergencia,
        numero_emergencia,
        foto,
        identificacion
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(resultado.rows[0]); // ✅ Devuelve el perfil actualizado
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

export default router;
