const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const { auth } = require("../middlewares/auth");
const { uploadPublicationImage } = require("../middlewares/upload");

// Crear publicación
router.post("/create", auth, PublicationController.create);

// Publicaciones de un usuario
router.get("/user/:id", auth, PublicationController.userPublications);

// Feed
router.get("/feed", auth, PublicationController.feed);

// Subir imagen
router.post("/upload-image/:id", auth, uploadPublicationImage.single("file"), PublicationController.uploadImage);

// Mostrar imagen
router.get("/image/:file", PublicationController.getImage);

// Actualizar publicación (solo texto)
router.put("/update/:id", auth, PublicationController.update);

// Eliminar publicación
router.delete("/remove/:id", auth, PublicationController.remove);

module.exports = router;