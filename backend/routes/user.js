const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");
const { uploadAvatar } = require("../middlewares/upload");
const { uploadCover } = require("../middlewares/upload");

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
// Subida de portada (protegido)
router.post("/upload-cover", auth, uploadCover.single("cover"), UserController.uploadCover);

// Mostrar avatar (público)
router.get("/avatar/:file", UserController.getAvatar);
// Mostrar portada (público)
router.get("/cover/:file", UserController.getCover);

module.exports = router;