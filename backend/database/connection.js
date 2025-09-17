const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/mi_red_social");
        console.log('Conectado correctamente a la BD: mi_red_social');
    }catch (error) {
        console.log(error);
        throw new Error('No se ha podido conectar a la base de datos');
    }
}

module.exports = connection;