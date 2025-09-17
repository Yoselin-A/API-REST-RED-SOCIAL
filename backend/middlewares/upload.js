const multer = require("multer");
const path = require("path");

// ----------------- Configuración para AVATARES -----------------
const storageAvatars = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("El archivo debe ser una imagen"), false);
  }
};

const uploadAvatar = multer({ storage: storageAvatars, fileFilter });


// ----------------- Configuración para PUBLICACIONES -----------------
const storagePublications = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/publications/");
  },
  filename: (req, file, cb) => {
    cb(null, "pub-" + Date.now() + path.extname(file.originalname));
  }
});

const uploadPublicationImage = multer({ storage: storagePublications, fileFilter });


// ----------------- Exportar ambos -----------------
module.exports = { uploadAvatar, uploadPublicationImage };