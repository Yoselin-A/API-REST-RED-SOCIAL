const jwt = require("jsonwebtoken");
const claveSecreta = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image
  };
  return jwt.sign(payload, claveSecreta, { expiresIn: "30d" });
};

module.exports = { createToken, claveSecreta };