const jwt = require("jsonwebtoken");

function verificarTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Acceso denegado. Token faltante." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Acceso denegado. Token inválido." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Guardamos el payload en req.usuario para usarlo en el controlador
    req.usuario = { id: payload.id, email: payload.email, rol_id: payload.rol };
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Token inválido o expirado." });
  }
}

module.exports = verificarTokenMiddleware;