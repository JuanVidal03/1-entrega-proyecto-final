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

        // se crea el timeStamp
        const timeStamp = new Date().toLocaleString();

        // creamos el objeto definitivo y lo pusheamos al array contenedor
        const newObject = { ...objeto, id: newId, timeStamp: timeStamp };
        objects.push(newObject);


        try{
            await fs.promises.writeFile(`${this.path}`, JSON.stringify(objects, null, 2));
            console.log('Producto añadido exitosamente!');
            // return newId;

        } catch(err) {
            throw new Error(`Errar al guardar: ${err}`)
        }
    }

    // obtebiendo procucto por id
    async getById(id){

        try {
            // obteniendo los objetos
            await this.getAll()
                .then((res) => {

                    // verificando si el id está en el array
                    if (res.some(product => product.id == id)) {

                        // filtramos y retornamos el productos
                        const producto = res.find(product => product.id == id);
                        console.log(producto);
                        return producto;

                    } else {
                        return 'El id de producto no existe.'
                    }


                }).catch((err) => {
                    console.log(`Ha ocurirdo un error al obtener la data: ${err}.`);
                })

        } catch (error) {
            console.log(`Error al obtener el id del producto: ${error}.`);
        }
    }

}

// exportando la clase para usarlo en server.js
module.exports = Products;