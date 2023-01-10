// importacion y configuracion de express
const express = require('express');
const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const routeProduct = express.Router();

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
        // renderizamois todos los productos en un json
        res.json(allProducts);

    } catch (error) {
        res.json({ error: `Hubo un error al obtener la data: ${error}` })
    }
});


// obteniendo producto por id
routeProduct.get('/:id', async(req, res) => {
    //obteniendo el id
    const id = parseInt(req.params.id);

    try {
        const producto = await product.getById(id);

        // se verifica si el return de product es un objeto
        if ( typeof(producto) === 'object') {
            // retorna el producto buscado
            res.json(producto);
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
    "foto": ""
}
*/
app.post('/api/productos', async(req, res) => {
    // obteniendo el obj con los datos del producto
    const body = req.body;

    try {
        // revisa si es admin o no
        if (admin === true) {
            // añadiendo productos
            await product.save(body);
            res.send('El producto fue añadido con exito!');

        } else {
            res.json({ error: 'Solo los administradores pueden añadir productos.' });
        }

    } catch (error) {
        res.json({ error: `Ha ocurrido y no se pudo subir el producto: ${error}` });
    };
});

// eliminando producto por su id
routeProduct.delete('/:id', async (req, res) => {

    // id del producto a eliminar
    const id = parseInt(req.params.id);

    try {

        // revisa si es damin o no
        if (admin === true) {
            await product.deleteById(id);
            res.send('Producto eliminado exitosamente!');
            
        } else {
            res.json({ error: 'Solo los administradores pueden añadir productos.' });
        }

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
        // verifica si e administrador
        if (admin === true) {
            // obtenemos todos los productos y encontramos al productoa actualizar
            let allProducts = await product.getAll();
            let findProduct = allProducts.find(ele => ele.id === id);
            // proceso de actualizar producto
            let updateProduct = { ...findProduct, ...body };
            await product.deleteById(id);
            await product.save(updateProduct);

            res.send('Producto actualizado exitosamente!');
        } else {
            res.json({ error: 'Solo los administradores pueden añadir productos.' });
        }

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

// creando un cart
app.post('/api/carrito', async(req,res) => {

    try {
        // se crea un cart
        await cart.createCart();
        res.send('Carrito creado exitosamente!');

    } catch (error) {
        res.json({ error: `Hubo un error al crear el carrito: ${error}` });
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

        // para que solo sean añadidos productos al carrito y no otro tipo  de valor
        if (typeof(foundProduct) === 'object'){

            // encontramos y añadimos el producto al cart
            await cart.saveProduct(id, foundProduct);
            res.send('Producto añadido satisfactoriamente al carrito!');

        } else {
            res.send(foundProduct);
        }

    } catch (error) {
        res.json({ error: 'Hubo un error al añadir el producto al carrito.' });
    }
});

// listar productos guardados en el carrito en especifico
routeCart.get('/:id/productos', async (req, res) => {

    // obtengo el id
    const id = parseInt(req.params.id);

    try {
        // obtendo el carrito que coincida con el id
        let foundCart = await cart.productsCartById(id);
        res.json(foundCart);

    } catch (error) {
        res.json(`Hubo un erro al obtener la data: ${error}`);
    }
});

// obteniendo carrito por Id
routeCart.get('/:id', async (req, res) => {
    // obtengo el id
    const id = parseInt(req.params.id);

    try {
        // retorna el carrito
        res.json(await cart.getById(id));

    } catch (error) {
        res.json({ error: `Hubo un error al eliminar el producto: ${error}` });
    }
});

// eliminar un carrito
routeCart.delete('/:id', async(req, res) => {
    // obtengo el id
    const id = parseInt(req.params.id);

    try {
        // eliminando el carrito
        await cart.deleteCartById(id);
        res.send('Carrito eliminado con exito!');

    } catch (error) {
        res.json({ error: `No se pudo eliminar el carrito: ${error}.` })
    }
});

// eliminando un producto dentro de un carrito
routeCart.delete('/:id/productos/:id_prod', async (req, res) => {

    // obteniendo id de producto y de carrito
    const id = parseInt(req.params.id);
    const id_prod = parseInt(req.params.id_prod);

    try {

        const deleteProduct = await cart.deleteProductWithinCart(id, id_prod);
        res.send(deleteProduct);

    } catch (error) {
        res.json({ error: `Hubo un error al eliminar el producto del carrito: ${error}` });
    }
});


// añadiendo sub rutas a la ruta principal de cart
app.use('/api/carrito', routeCart);


// en caso de que la ruta no exista
app.get('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});
app.post('*', (req, res) => {
    res.json({ error: 'La ruta a la que intenta acceder no existe.' })
});


// iniciando server y mapeo de errores
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando el puerto: ${server.address().port}`);
});
server.on('error', err => console.log(`Error en el servidor: ${err}`));