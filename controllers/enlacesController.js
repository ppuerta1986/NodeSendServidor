const Enlaces = require('../models/Enlaces');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {
    // revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array()})
    }

    //console.log(req.body);
    //crear un objeto
    const { nombre_original, nombre  } = req.body;

    const enlace = new Enlaces();
    enlace.url =  shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;

    //console.log(enlace);

    // Si el usuario esta autenticado
    if(req.usuario){
        const { password, descargas } = req.body;

        // Asignar al enlace el numero de descargas
        if(descargas) {
            enlace.descargas = descargas;
        }
        // Asignar password
        if(password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        //Asignar autor
        enlace.autor = req.usuario.id;
    }

    //Almacenar en la BD
    try {
        await enlace.save();
        return res.json({msg: `${enlace.url}`});
        next();
    } catch (error) {
        console.log(error);
    }
}

// Obtiene un listado de todos los enlaces


exports.todosEnlaces = async (req,res) => {
    try {
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({enlaces});
    } catch (error) {
        console.log(error)
    }
}
// retorna si el enlace tiene password

exports.tienePassword = async (req,res,next) => {
    //console.log(req.params.url);

    // verificar que existe el enlace

    const { url } = req.params;
    console.log(url);

    const enlace = await Enlaces.findOne({url});


    if(!enlace) {
        res.status(404).json({msg: 'Ese enlace no existe'});
        return next();
    }

    if(enlace.password) {
        return res.json({password: true, enlace: enlace.url});
    }
    next();
}

exports.verificarPassword = async (req,res,next) => {
    const { url } = req.params;
    const { Password } = req.body;
    // CONSULTART POR EL ENLACE

    const enlace = await Enlaces.findOne({url});
    // Veficar el password
    if(bcrypt.compareSync(Password, enlace.password)) {
        // Permitir al usuario descargar el archivo
        next();
    } else {
        return res.status(401).json({msg: 'Password Incorrrecto'});
    }


}

// obtener el enlace

exports.obtenerEnlace = async (req, res, next) => {
    //console.log(req.params.url);

    // verificar que existe el enlace

    const { url } = req.params;
    console.log(url);

    const enlace = await Enlaces.findOne({url});


    if(!enlace) {
        res.status(404).json({msg: 'Ese enlace no existe'});
        return next();
    }
    // Si el enlace existe

    res.json({archivo: enlace.nombre, password: false});

    next();

}