// iniciando modulo fs de node
const fs = require('fs');

//inicio de la clase
class Products {

    constructor(path){
        this.path = path;
    }

    // metodo para obtener todos los productos
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

    // guardando los productos
    async save(objeto){

        const objects = await this.getAll();
        let newId;

        // con esto se define el id que el elemento va a tener
        if (objects.length == 0) {
            newId = 1
        } else {
            newId = objects[objects.length-1].id+1;
        }

        // timeStamp producto
        const timeStamp = Date.now();

        // codigo producto
        const code = Math.floor(Math.random(1000) * 10000);

        

        // creamos el objeto definitivo y lo pusheamos al array contenedor
        const newObject = { ...objeto, id: newId, timeStamp: timeStamp, codigo: code };
        objects.push(newObject);


        try{
            await fs.promises.writeFile(`${this.path}`, JSON.stringify(objects, null, 2));
            console.log('Producto añadido exitosamente!');

        } catch(err) {
            throw new Error(`Errar al guardar: ${err}`)
        }
    }

    // obtebiendo procucto por id
    async getById(id){

        try {
            // inicializo la variable producto
            let producto;

            // obteniendo los objetos
            await this.getAll()
                .then((res) => {

                    // verificando si el id está en el array
                    if (res.some(product => product.id == id)) {

                        // encontramos el producto
                        producto = res.find(product => product.id == id);

                    } else {
                        producto = 'El id de producto no existe.';
                    }


                }).catch((err) => {
                    console.log(`Ha ocurirdo un error al obtener la data: ${err}.`);
                })
            
            // este resultado se va a renderizar
            return producto;

        } catch (error) {
            console.log(`Error al obtener el id del producto: ${error}.`);
        }
    }


    // eliminaod producto por id
    async deleteById(id){

        try {

            // obteniendo los objetos
            await this.getAll()
                .then( async (res) => {

                    if(res.find(element => element.id === id)){

                    const index = res.findIndex(ele => ele.id === id);
                    const indice = index;

                    res.splice(indice, 1);
                    await fs.promises.writeFile(`${this.path}`, JSON.stringify(res, null, 2));
                    console.log('Producto eliminado exitosamente!');

                    } else {
                        console.log(`El producto con el id: ${id} no fue encontrado.`);
                    }

                }).catch((err) => {
                    console.log(`Ha ocurirdo un error al obtener la data: ${err}.`);
                })

        } catch (error) {
            console.log(`Error en el servidor: ${error}`);
        }
    }
}

// exportando la clase para usarlo en server.js
module.exports = Products;