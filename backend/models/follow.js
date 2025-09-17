const { Schema, model } = require("mongoose");

const FollowSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User", required: true },     // el que sigue
  followed: { type: Schema.ObjectId, ref: "User", required: true }, // al que sigo
  created_at: { type: Date, default: Date.now }
});

module.exports = model("Follow", FollowSchema, "follows");