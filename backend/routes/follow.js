const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const { auth } = require("../middlewares/auth");

// Seguir
router.post("/follow/:id", auth, FollowController.followUser);

// Dejar de seguir
router.delete("/unfollow/:id", auth, FollowController.unfollowUser);

// Ver a quién sigo
router.get("/following", auth, FollowController.following);

// Ver quién me sigue
router.get("/followers", auth, FollowController.followers);

module.exports = router;