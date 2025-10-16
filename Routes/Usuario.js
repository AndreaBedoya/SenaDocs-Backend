import express from "express";
import { obtenerPerfil, actualizarPerfil } from "../Controllers/Usuario.js";

const router = express.Router();

router.get("/:documento", obtenerPerfil);
router.put("/:documento", actualizarPerfil);

export default router;
