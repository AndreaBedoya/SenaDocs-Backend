import express from "express";
import { verificarToken } from "../middlewares/verificarToken.js";

const router = express.Router();

router.post("/upload", verificarToken, (req, res) => {
  // lógica de subida de archivos
  res.json({ mensaje: "Subida permitida. Usuario autenticado." });
});

export default router;
