const Follow = require("../models/follow");

// Seguir a un usuario
const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const followedId = req.params.id;

    if (userId === followedId) {
      return res.status(400).send({ status: "error", message: "No puedes seguirte a ti mismo" });
    }

    const exist = await Follow.findOne({ user: userId, followed: followedId });
    if (exist) {
      return res.status(400).send({ status: "error", message: "Ya sigues a este usuario" });
    }

    const follow = new Follow({ user: userId, followed: followedId });
    await follow.save();

    return res.status(200).send({
      status: "success",
      message: "Usuario seguido",
      follow
    });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al seguir usuario", error: error.message });
  }
};

// Dejar de seguir
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const followedId = req.params.id;

    const deleted = await Follow.findOneAndDelete({ user: userId, followed: followedId });

    if (!deleted) {
      return res.status(404).send({ status: "error", message: "No seguías a este usuario" });
    }

    return res.status(200).send({ status: "success", message: "Has dejado de seguir", follow: deleted });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al dejar de seguir", error: error.message });
  }
};

// Ver a quién sigo
const following = async (req, res) => {
  try {
    const userId = req.user.id;
    const follows = await Follow.find({ user: userId }).populate("followed", "-password");
    return res.status(200).send({ status: "success", following: follows });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al obtener seguidos", error: error.message });
  }
};

// Ver quién me sigue
const followers = async (req, res) => {
  try {
    const userId = req.user.id;
    const follows = await Follow.find({ followed: userId }).populate("user", "-password");
    return res.status(200).send({ status: "success", followers: follows });
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Error al obtener seguidores", error: error.message });
  }
};

module.exports = { followUser, unfollowUser, following, followers };