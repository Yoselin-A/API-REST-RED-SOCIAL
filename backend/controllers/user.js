const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");  
const User = require("../models/user"); 
const path = require("path");
const fs = require("fs");

// Registro de usuarios
const register = async (req, res) => {
    try {
        // Recoger datos de la petición
        let params = req.body;

        // Comprobar que me llegan bien (+validación)
        if (!params.name || !params.email || !params.password || !params.nick) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Control usuarios duplicados
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec();

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña 
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la BD
        const userStored = await user_to_save.save(); // Eliminar callback, usando await

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta de usuarios",
            error: error.message
        });
    }
};


const login = async (req, res) => {
    try {
        // Recoger parámetros del body
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Buscar en la BD si existe el email o usuario
        const user = await User.findOne({ email: params.email })
            .select({ name: 1, surname: 1, nick: 1, email: 1, role: 1, image: 1, password: 1 })
            .exec();


        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario"
            });
        }

        // Comprobar la contraseña
        const coincide = await bcrypt.compare(params.password, user.password);
        if (!coincide) {
            return res.status(400).send({
                status: "error",
                message: "Contraseña incorrecta"
            });
        }

        // Si es necesario, aquí puedes generar un token JWT, por ejemplo:
        const token = jwt.createToken(user);

        // const token = jwt.sign({ id: user._id }, 'tu_secreto', { expiresIn: '1h' });

        // Excluir la contraseña antes de devolver los datos del usuario
        user.password = undefined;

        // Devolver los datos del usuario (y el token si usas JWT)
        return res.status(200).send({
            status: "success",
            message: "Login exitoso",
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                nick: user.nick,
                email: user.email,
                role: user.role,
                image: user.image
            },
            token
        });


    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en el proceso de login",
            error: error.message
        });
    }
};

const profile = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token
    const user = await User.findById(userId).select("-password"); // sin password

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).send({
      status: "success",
      user
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al obtener perfil",
      error: error.message
    });
  }
};

// Listado de usuarios con paginación
const list = async (req, res) => {
  try {
    // Recoger página de la query (ej: ?page=2)
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;

    // Ejecutar paginación
    const options = {
      page,
      limit,
      select: "-password -__v", // no mostrar password ni __v
      sort: { created_at: -1 } // ordenar más recientes primero
    };

    const result = await User.paginate({}, options);

    return res.status(200).send({
      status: "success",
      users: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al listar usuarios",
      error: error.message
    });
  }
};

// controllers/user.js
const update = async (req, res) => {
  try {
    const userIdentity = req.user; // viene del token
    const userToUpdate = req.body;

    // Evitar actualizar campos sensibles
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.password;

    // Validar duplicados en email o nick
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() }
      ]
    });

    let duplicateUser = false;
    users.forEach(u => {
      if (u && u._id != userIdentity.id) duplicateUser = true;
    });

    if (duplicateUser) {
      return res.status(200).send({
        status: "error",
        message: "El email o nick ya está en uso"
      });
    }

    // Actualizar
    const updatedUser = await User.findByIdAndUpdate(
      userIdentity.id,
      userToUpdate,
      { new: true }
    ).select("-password");

    return res.status(200).send({
      status: "success",
      message: "Usuario actualizado correctamente",
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en la actualización",
      error: error.message
    });
  }
};

// Subir avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "No se ha subido ninguna imagen"
      });
    }

    // Actualizar en BD
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    ).select("-password");

    return res.status(200).send({
      status: "success",
      message: "Avatar actualizado correctamente",
      file: req.file.filename,
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al subir avatar",
      error: error.message
    });
  }
};

// Devolver avatar
const getAvatar = (req, res) => {
  const file = req.params.file;
  const filePath = "./uploads/avatars/" + file;

  fs.stat(filePath, (err) => {
    if (!err) {
      return res.sendFile(path.resolve(filePath));
    } else {
      return res.status(404).send({
        status: "error",
        message: "El avatar no existe"
      });
    }
  });
};

module.exports = {
  register,
  login,
  profile,
  list,
  update,
  uploadAvatar,
  getAvatar
};