const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  ciudad: String,
  nacimiento: String,
  funciones: String,
  documento: String,
  cargo: String,
  sangre: String,
  telefono: String,
  nombreEmergencia: String,
  numeroEmergencia: String,
  foto: String,
});

module.exports = mongoose.model("Usuario", usuarioSchema);
