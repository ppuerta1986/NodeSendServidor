const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
// crear el servidor

const app = express();

conectarDB();

// Habilitar cors
const opcionesCors = {
    origin: process.env.FRONTEND_URL
};
app.use(cors(opcionesCors));
// Puerto de la app

const port = process.env.PORT || 4000;

//Habilitar leer los valores de body

app.use(express.json());

// habilitar carpeta publica
app.use( express.static('uploads'));


// Rutas de la app

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
});