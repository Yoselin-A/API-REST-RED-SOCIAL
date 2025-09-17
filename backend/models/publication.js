const { Schema, model } = require("mongoose");

const PublicationSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  file: { type: String, default: null }, // para imágenes o archivos opcionales
  created_at: { type: Date, default: Date.now }
});

module.exports = model("Publication", PublicationSchema, "publications");