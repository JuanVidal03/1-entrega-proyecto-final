// importacion y configuracion de express
const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const routeProduct = express.Router();
const routeCart = express.Router();

// condiguración de ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', './views');

// creando instancia de clase para crear productos y sbirlos a fileSystem
const Products = require('./Products.js');
const product = new Products('productos.json');


// saber si el usuario es damin o user, si es false no se mostrara el formulario de registrar productos
const admin = true;










/*=================
RUTAS
=================*/

/* RUTAS PRODUCTOS */

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
routeProduct.get('/:id', async(req, res) => {
    //obteniendo el id
    const id = parseInt(req.params.id);

    try {
        const producto = await product.getById(id);

        // se verifica si el return de product es un objeto, para aí renderizar el layout que muestra el producto
        if ( typeof(producto) === 'object') {
            res.render('./pages/productById.ejs', { product: producto });
        } else {
            res.json({ error: 'El id ingresado no existe.' })
        }

    } catch (error) {
        res.json({ error: `Ha ocurrido un error al otener el productos: ${error}.` })
    }
});


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

// eliminando producto por su id
routeProduct.delete('/:id', async (req, res) => {

    // id a eliminar
    const id = parseInt(req.params.id);

    try {
        // const deleteProduct = await product.deleteById(id);
        await product.deleteById(id);
        res.send('Producto eliminado exitosamente!');

    } catch (error) {
        res.json({ error: `Ha ocurrido y no se pudo encontrar el id de producto: ${error}` });
    }
});


// actualizando un elemento por su id
routeProduct.put('/:id', async(req, res) => {

    // obteniendo data y id
    let body = req.body;
    let id = parseInt(req.params.id);

    try {
        
        let allProducts = await product.getAll();
        let findProduct = allProducts.find(ele => ele.id === id);

        let updateProduct = { ...findProduct, ...body };
        await product.deleteById(id);
        await product.save(updateProduct);

        res.send('Producto actualizado exitosamente!');

    } catch (error) {
        res.json({ error: `Ha ocurrido y no se pudo encontrar el id de producto: ${error}` });
    }
});

// accedieno añadieno sub rutas a la ruta principal de productos
app.use('/api/productos', routeProduct);






// en caso de que la ruta no exista
app.get('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});
app.post('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});
app.put('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});
app.delete('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});


// iniciando server y mapeo de errores
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando el puerto: ${server.address().port}`);
});
server.on('error', err => console.log(`Error en el servidor: ${err}`));