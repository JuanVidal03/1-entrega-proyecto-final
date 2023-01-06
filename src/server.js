// importacion y configuracion de express
const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const router = express.Router();

// condiguración de ejs
const ejs = require('ejs');
const { join } = require('path');
app.set('view engine', 'ejs');
app.set('views', './views');

// creando instancia de clase para crear productos y sbirlos a fileSystem
const Products = require('./Products.js');
const product = new Products('productos.json');


// saber si el usuario es damin o user
const admin = true;


/*=================
SOCKET.IO SET UP
=================*/
/* 
const srv = require('http').Server(app);
const io = require('socket.io')(srv);
*/










/*=================
RUTAS
=================*/

// obteniendo todos los productos
app.get('/api/productos', async(req, res) => {

    try {
        // obteniendo productos
        const allProducts = await product.getAll();
        // renderizando los datos del ciente
        res.render('./pages/home.ejs', { productos: allProducts, admin: admin });

    } catch (error) {
        res.json({ error: `Paso algo malo: ${error}` })
    }
});


// obteniendo producto por id
app.get('/api/productos/:id', async(req, res) => {
    //obteniendo el id
    const id = req.params.id;

    try {
        const producto = await product.getById(id);
        // res.render('./partials/productById.ejs', { product: producto });
        res.json({ product: producto });



    } catch (error) {
        res.json({ error: `Ha ocurrido un error al otener el productos: ${error}.` })
    }
})



// añadiendo productos
app.post('/api/productos', async(req, res) => {
    // obteniendo el obj con los datos del producto
    const body = req.body;

    try {
        // añadiendo productos
        await product.save(body);
        // redirijiendo a la página principal
        res.redirect('/api/productos');

    } catch (error) {
        res.json({ error: `Ha ocurrido y no se pudo subir el producto: ${error}` });
    };
});









// iniciando server y mapeo de errores
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando el puerto: ${server.address().port}`);
});
server.on('error', err => console.log(`Error en el servidor: ${err}`));