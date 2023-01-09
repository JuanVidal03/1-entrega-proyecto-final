// importacion y configuracion de express
const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const routeProduct = express.Router();

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
// body para ingresar un producto por postman
/*
{
    "nombre": "",
    "descripcion": "",
    "precio": 00,
    "stock": 00,
    "foto": "",
}
*/
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

// añadiendo sub rutas a la ruta principal de productos
app.use('/api/productos', routeProduct);



/* RUTAS CARRITO */
// creando instancias del carrito y router
const Cart = require('./Cart.js');
const cart = new Cart('cart.json');
const routeCart = express.Router();

// creando un cart y añadiendo un producto
app.post('/api/carrito', async(req,res) => {

    try {
        // se crea un cart
        await cart.createCart();

    } catch (error) {
        res.json({ error: 'Hubo un error al crear el carrito.' });
    }

});


// añadiendo productos a un cart previamente creado
routeCart.post('/:id/productos', async(req, res) => {

    // obteniendo el id del cart y el producto a añadir en el cart
    const id = parseInt(req.params.id);
    const body = req.body;

    try {

        // variable donde se está el producto a añadir al carrito
        let foundProduct;

        // obtenemos todos los productos
        const allProducts = await product.getAll();
        //verificamos si el producto que quiere ingresar ya existe.
        if (allProducts.some(ele => ele.id === body.id)) {
            // guardo el producto en la variable creada previamente
            foundProduct = allProducts.find(ele => ele.id === body.id);
        } else {
            foundProduct = 'El producto que intentas agregar no existe.'
        }

        // si el producuto existe previamente se va agregar al carrito
        if (typeof(foundProduct) === 'object'){
            // encontramos y añadimos el producto al cart
            await cart.saveProduct(id, foundProduct);
            res.send('Producto añadido satisfactoriamente al carrito!');

        } else {
            res.send('El producto que se intenta agregar al carrito no existe.');
        }

        //evitar agregar al carrito productos repetidos
        /* 
        PARA HACEEEEEEEEEEEEEEEEEEEEEEER
        */


    } catch (error) {
        res.json({ error: 'Hubo un error al añadir el producto al carrito.' });
    }
});


// listar productos guardados en el carrito



// añadiendo sub rutas a la ruta principal de cart
app.use('/api/carrito', routeCart);





// en caso de que la ruta no exista
app.get('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});


// iniciando server y mapeo de errores
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando el puerto: ${server.address().port}`);
});
server.on('error', err => console.log(`Error en el servidor: ${err}`));