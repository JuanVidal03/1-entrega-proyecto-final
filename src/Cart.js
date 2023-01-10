// iniciando modulo fs de node
const fs = require('fs');

//inicio de la clase
class Cart {

    constructor(path){
        this.path = path;
    }

    // metodo para obtener todos los productos dentro del carrito
    async getAll(){
        try {
            
            const objs = await fs.promises.readFile(`${this.path}`, 'utf-8', err => {
                if(err){
                    console.log(err);
                }
            });
            return JSON.parse(objs);


        } catch (err) {
            console.log(`ERROR: ${err}`);
            return [];
        }
    }

    // obteniendo los productos de un carrito por id
    async productsCartById(id){
        
        try {
            // inicializo la avriable que va contener el cart
            let foundCart;

            // obtengo todos los productos y retorno el carrito que coincida con el id
            await this.getAll()
                .then((res) => {
                    if (res.some(cart => cart.id === id)) {
                        // se encuentra el carrito y devuelve solo los productos.
                        foundCart = res.find(cart => cart.id === id); // cart
                        foundCart = foundCart.productos; // only products

                    } else {
                        foundCart = 'El carrito al que está intentando ingresar no existe.';
                    }

                }).catch((err) => {
                    console.log(`ERROR al obtener la data: ${err}`);
                });

            // return del carrito
            return foundCart;

        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    }

    // creando un cart
    async createCart(){

        // obteniendo los carritos
        const carts = await this.getAll();
        let newId;

        // con esto se define el id que el cart va a tener
        if (carts.length == 0) {
            newId = 1
        } else {
            newId = carts[carts.length-1].id+1;
        }

        // timeStamp cart
        const timeStamp = Date.now();


        // creamos el objeto definitivo y lo pusheamos al array contenedor
        const newObject = { id: newId, timeStamp: timeStamp, productos: [ ] };
        carts.push(newObject);


        try{
            await fs.promises.writeFile(`${this.path}`, JSON.stringify(carts, null, 2));
            console.log('Carrito creado exitosamente!');

        } catch(err) {
            throw new Error(`Error al guardar: ${err}`)
        }
    }

    // guardando un producto dentro de un cart previamente creado
    async saveProduct(cartId, producto){

        try {
            // inicializo variable que guarda el cart encontrado
            let foundCart;
            // todos los carritos creados
            let allCarts;

            // obtengo todos los productos y encuentro el id del cart requerido por el cliente
            await this.getAll()
                .then((res) => {
                    // verifico si es carrito existe y retorno el cart
                    if(res.some(ele => ele.id === cartId)){
                        // almeceno todos los carritos, para luego actualzizar el cart.json
                        allCarts = res;
                        // encontramos el carrito
                        foundCart = res.find(ele => ele.id === cartId);

                    } else{
                        foundCart = `no existe el carrito con este id: ${cartId}.`
                    }

                }).catch((err) => {
                    console.log(`Ha ocurirdo un error al obtener la data: ${err}.`);
                });

            // se añade el producto al cart identificado y se hace que se actualice el archivo json con toda la data.
            foundCart.productos.push(producto);

            await fs.promises.writeFile(`${this.path}`, JSON.stringify(allCarts, null, 2));
            console.log('Producto añadido al carrito exitosamente!');

        } catch (error) {
            throw new Error(`Error al guardar el producto al carrito: ${error}`)
        }
    }

    // obtebiendo cart por id
    async getById(id){

        try {
            // inicializo la variable cart
            let cart;

            // obteniendo los objetos
            await this.getAll()
                .then((res) => {

                    // verificando si el id está en el array
                    if (res.some(cart => cart.id == id)) {

                        // encontramos el producto
                        cart = res.find(cart => cart.id == id);

                    } else {
                        cart = 'El id del carrito no existe.';
                    }

                }).catch((err) => {
                    console.log(`Ha ocurirdo un error al obtener la data: ${err}.`);
                });
            
            // este resultado se va a renderizar
            return cart;

        } catch (error) {
            console.log(`Error al obtener el id del producto: ${error}.`);
        }
    }

    // eliminando cart por id
    async deleteCartById(id){

        try {

            // obteniendo todos los carritos y eliminando el seleccionado
            await this.getAll()
                .then(async(res) => {

                    if (res.some(cart => cart.id === id)) {
                        // obtengo la posición del array y lo elimino usando el metodo splice
                        const indexCart = res.findIndex(cart => cart.id === id);
                        res.splice(indexCart, 1);
                        await fs.promises.writeFile(`${this.path}`, JSON.stringify(res, null, 2));

                        console.log('Carrito eliminado con exito!');
                    } else {
                        console.log(`El id: ${id} del carrito no existe.`);
                    }

                }).catch((err) => {
                    console.log(`Hubo un error al obtener los carritos: ${err}`);
                })

        } catch (error) {
            console.log(`Error en el servidor: ${error}`);
        }
    }

    // eliminar producto de un carrito
    async deleteProductWithinCart(id, id_prod){

        try {
            let result;

            await this.getAll()
                .then(async(res) => {
                    // todos los carritos
                    let allCarts = res;
                    // variable que almacena cart
                    let cart;

                    // obteniendo el cart
                    if(allCarts.some(cart => cart.id === id)){
                        cart = allCarts.find(cart => cart.id === id);
                    } else {
                        cart = 'El carrito no existe.'
                    }

                    // obteniendo productos del cart
                    let allProducts = cart.productos;

                    // verificando si el producto está dentro del carrito
                    if (allProducts.some(product => product.id === id_prod)) {

                        let foundProduct = allProducts.findIndex(product => product.id === id_prod);
                        allProducts.splice(foundProduct, 1);

                        await fs.promises.writeFile(`${this.path}`, JSON.stringify(res, null, 2));

                        result = 'Producto eliminado con exito!';

                    } else {
                        result = 'El producto no está en el carrito.';
                    }

                }).catch((err) => {
                    console.log(`Error al obtener los carritos: ${err}`);
                });

            // retorna el texto de confirmación sea el caso de la operación
            return result;

        } catch (error) {
            console.log(`Error en el servidor: ${error}`);
        }
    }
}

// exportando la clase para usarlo en server.js
module.exports = Cart;