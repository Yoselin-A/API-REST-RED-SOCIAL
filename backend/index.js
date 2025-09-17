// Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Conectar BD
connection();

// Crear servidor
const app = express();
const port = 3900;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const userRoutes = require("./routes/user");
const followRoutes = require("./routes/follow");
const publicationRoutes = require("./routes/publication");

// Usar rutas
app.use("/api/users", userRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/publications", publicationRoutes);

// Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
  return res.status(200).json({
    id: 1,
    nombre: "Yoselin Alvarez",
    web: "yoselalvarez.com",
  });
});

// Poner a escuchar
app.listen(port, () => {
  console.log("Servidor corriendo en el puerto " + port);
});