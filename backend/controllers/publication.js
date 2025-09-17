const Publication = require("../models/publication");
const Follow = require("../models/follow");
const path = require("path");
const fs = require("fs");

// Crear publicación
const create = async (req, res) => {
  try {
    const params = req.body;
    if (!params.text) {
      return res.status(400).send({ status: "error", message: "El texto es obligatorio" });
    }

    let publication = new Publication({
      user: req.user.id,
      text: params.text
    });

    const saved = await publication.save();

    return res.status(200).send({ status: "success", publication: saved });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al crear publicación", error: error.message });
  }
};

// Ver publicaciones de un usuario
const userPublications = async (req, res) => {
  try {
    const userId = req.params.id;
    const publications = await Publication.find({ user: userId })
      .sort({ created_at: -1 })
      .populate("user", "-password");

    return res.status(200).send({ status: "success", publications });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al obtener publicaciones", error: error.message });
  }
};

// Feed: publicaciones de usuarios que sigo
const feed = async (req, res) => {
  try {
    const follows = await Follow.find({ user: req.user.id }).select("followed");
    const followedIds = follows.map(f => f.followed);

    const publications = await Publication.find({ user: { $in: followedIds } })
      .sort({ created_at: -1 })
      .populate("user", "-password");

    return res.status(200).send({ status: "success", feed: publications });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al cargar feed", error: error.message });
  }
};

// Subir imagen de publicación
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ status: "error", message: "No se ha subido ningún archivo" });
    }

    const publicationId = req.params.id;

    const updated = await Publication.findByIdAndUpdate(
      publicationId,
      { file: req.file.filename },
      { new: true }
    );

    return res.status(200).send({ status: "success", publication: updated });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al subir imagen", error: error.message });
  }
};

// Mostrar imagen
const getImage = (req, res) => {
  const file = req.params.file;
  const filePath = "./uploads/publications/" + file;

  fs.stat(filePath, (err) => {
    if (!err) {
      return res.sendFile(path.resolve(filePath));
    } else {
      return res.status(404).send({ status: "error", message: "La imagen no existe" });
    }
  });
};

const update = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const { text } = req.body;

    const updated = await Publication.findOneAndUpdate(
      { _id: publicationId, user: req.user.id },
      { text },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "error", message: "No encontrada o no es tuya" });
    }

    return res.status(200).json({
      status: "success",
      publication: updated,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error al actualizar publicación" });
  }
};

// Eliminar publicación
const remove = async (req, res) => {
  try {
    const publicationId = req.params.id;

    // 👇 Solo elimina si la publicación pertenece al usuario logueado
    const deleted = await Publication.findOneAndDelete({
      _id: publicationId,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).send({ status: "error", message: "No encontrada o no es tuya" });
    }

    return res.status(200).send({
      status: "success",
      message: "Publicación eliminada",
      publication: deleted,
    });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al eliminar publicación" });
  }
};

module.exports = { create, userPublications, feed, uploadImage, getImage, update, remove };