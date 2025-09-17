const jwt = require("jsonwebtoken");
const { claveSecreta } = require("../services/jwt");

exports.auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "La petición no tiene cabecera de autenticación"
    });
  }

  const token = req.headers.authorization.split(" ")[1]; // "Bearer <token>"

  try {
    const payload = jwt.verify(token, claveSecreta);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).send({
      status: "error",
      message: "Token inválido",
      error: error.message
    });
  }
};