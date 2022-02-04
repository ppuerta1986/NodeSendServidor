const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlaces');

exports.subirArchivo = async (req,res) => {

    const configuracionMulter = {
        limits: { fileSize : req.usuario ? 1024 * 1024 * 10 : 1024 * 1024  },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) => {
                //const extension = file.mimetype.split('/')[1];
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            }
        })
    }
    
    const upload = multer(configuracionMulter).single('archivo');

    upload(req, res, async (error) => {
        console.log(req.file);
        if(!error) {
            res.json({archivo: req.file.filename});
        } else {
            console.log(error);
            return next();
        }
    });

}

exports.eliminarArchivo = async (req,res) => {
    console.log(req.archivo);

    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
        console.log("archivo eliminado");
    } catch (error) {
        console.log(error);
    }
}

// descargar un archivo

exports.descargar = async (req, res, next) => {


    // obtener el enlace
    const { archivo } = req.params;
    const enlace = await Enlaces.findOne({nombre: archivo});

    const archivodescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivodescarga);

    // Eliminar el archivo y la entrada de la base de datos
    // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const { descargas, nombre } = enlace;
    if(descargas === 1) {
        //console.log('si solo 1');
        // Eliminar el archivo
        req.archivo = nombre;
        // eliminar la entrada
        await Enlaces.findOneAndRemove(enlace.id);
        next();

    } else {
        // si las descargas son > a 1 - restar 1
        enlace.descargas--;
        await enlace.save();
        //console.log('Aun quedan descargas')
    }

}