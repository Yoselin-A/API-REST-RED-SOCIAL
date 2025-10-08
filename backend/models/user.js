const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// Definición del esquema de usuario
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: String,
  bio: String,
  nick: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "role_user"
  },
  image: {
    type: String,
    default: "default.png"
  },
  cover: {
    type: String,
    default: "default-cover.png"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Añadir el plugin de paginación
userSchema.plugin(mongoosePaginate);

// Exporta el modelo
module.exports = model("User", userSchema, "users");