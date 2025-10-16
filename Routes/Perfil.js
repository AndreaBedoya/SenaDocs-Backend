import express from "express";
import pool from "../db.js";

const router = express.Router();

// ✅ Obtener perfil por documento
router.get("/:documento", async (req, res) => {
  const { documento } = req.params;

  try {
    const resultado = await pool.query(
      "SELECT * FROM perfil_usuarios WHERE documento = $1",
      [documento]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al consultar perfil" });
  }
});

// ✅ Actualizar perfil por documento
router.put("/:documento", async (req, res) => {
  const { documento } = req.params;
  const {
    nombre,
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
    const existe = await pool.query(
      "SELECT * FROM perfil_usuarios WHERE documento = $1",
      [documento]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const resultado = await pool.query(
      `UPDATE perfil_usuarios SET
        nombre = $1,
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
      WHERE documento = $12
      RETURNING *`,
      [
        nombre,
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
        documento
      ]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error.stack);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});


export default router;
