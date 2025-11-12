import express from "express";
import pool from "../config/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: Registro de usuarios.
 *     description: registrar usuario por medio de identificaion, nombre, correo y contraseña.
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificacion:
 *                 type: string
 *                 example: "1002003004"
 *               nombre_completo:
 *                 type: string
 *                 example: "Juan Hernandez"
 *               correo:
 *                 type: string
 *                 example: "juan@example.com"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "juan123"
 *               ciudad:
 *                 type: string
 *                 example: "Bogotá"
 *               nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               sangre:
 *                 type: string
 *                 example: "O+"
 *               telefono:
 *                 type: string
 *                 example: "+573001112233"
 *               foto:
 *                 type: string
 *                 example: "base64_encoded_image"
 *               cargo:
 *                 type: string
 *                 example: "Instructor"
 *               funciones:
 *                 type: string
 *                 example: "Enseñanza y administración"
 *               nombre_emergencia:
 *                 type: string
 *                 example: "María Hernandez"
 *               numero_emergencia:
 *                 type: string
 *                 example: "+573001112244"
 *     responses:
 *       201:
 *         description: Registro exitoso
 *       400:
 *         description: Campos faltantes por llenar
 *       401:
 *         description: Datos invalidos
 *       409:
 *         description: Correo en uso
 *       500:
 *         description: Error de servidor
 */
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

