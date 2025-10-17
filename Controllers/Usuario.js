import pool from "../db.js";

export const obtenerPerfil = async (req, res) => {
  try {
    const { documento } = req.params;
    const result = await pool.query("SELECT * FROM registro_usuarios WHERE documento = $1", [documento]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const {
      nombre, ciudad, nacimiento, funciones, correo, cargo, sangre,
      telefono, nombre_emergencia, numero_emergencia, foto
    } = req.body;

    const { documento } = req.params;

    await pool.query(
      `INSERT INTO perfil_usuarios (
        documento, nombre, ciudad, nacimiento, funciones, correo, cargo, sangre,
        telefono, nombre_emergencia, numero_emergencia, foto
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12
      )
      ON CONFLICT (documento) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        ciudad = EXCLUDED.ciudad,
        nacimiento = EXCLUDED.nacimiento,
        funciones = EXCLUDED.funciones,
        correo = EXCLUDED.correo,
        cargo = EXCLUDED.cargo,
        sangre = EXCLUDED.sangre,
        telefono = EXCLUDED.telefono,
        nombre_emergencia = EXCLUDED.nombre_emergencia,
        numero_emergencia = EXCLUDED.numero_emergencia,
        foto = EXCLUDED.foto`,
      [
        documento, nombre, ciudad, nacimiento, funciones, correo, cargo, sangre,
        telefono, nombre_emergencia, numero_emergencia, foto
      ]
    );

    res.json({ mensaje: "Perfil actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
