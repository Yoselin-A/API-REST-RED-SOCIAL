const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");
const { uploadAvatar } = require("../middlewares/upload");

// Registro y login
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Ruta protegida de perfil
router.get("/profile", auth, UserController.profile);

// Listado de usuarios con paginación
router.get("/list", auth, UserController.list);

// Actualizar datos de usuario
router.put("/update", auth, UserController.update);

// Subida de avatar (protegido)
router.post("/upload-avatar", auth, uploadAvatar.single("avatar"), UserController.uploadAvatar);

// Mostrar avatar (público)
router.get("/avatar/:file", UserController.getAvatar);

module.exports = router;