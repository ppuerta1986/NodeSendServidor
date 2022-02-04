const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoUsuario = async (req, res) => {

    // Mostrar mensajes de error

    const errores = validationResult(req);

    if( !errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array()})
    }

    // verificar si el usuario ya estuvio regustrado
    const { email } = req.body;

    let usuario = await Usuario.findOne({email});

    if(usuario) {
        return res.status(400).json({msg: "el usuario ya esta registrado"});
    }

    // crear un nuevo usuario
    usuario = new Usuario(req.body);

    // hashear el password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);

    try {
        await usuario.save();
        res.json({msg: 'Usuario Creado Correctamente'})
    } catch (error) {
        console.log(error);
    }

}