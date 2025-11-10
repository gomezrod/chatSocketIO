import {promises as fs} from 'fs';
import path from 'node:path'

const baseDir = process.cwd();
const dataDir = path.resolve(baseDir, 'db');
const productsFilePath = path.join(dataDir, 'users.json');

const ensureDataDir = async () => {
    try {
        await fs.mkdir(dataDir, {recursive: true});
        
    } catch(err) {
        console.error("Error creando directorio de datos (users)");
        
    }
}

const readData = async (filePath) => {
    await ensureDataDir(); // Asegura que el directorio exista
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // Si el archivo no existe, retorna un arreglo vacío
        }
        throw error;
    }
};

const writeData = async (filePath, data) => {
    await ensureDataDir();
    try {
        const datos = await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return datos;
    }catch(err){
        if(err.code === 'ENOENT'){
            return [];
        }
        throw err;
    }
}


export class UsersManager{
    constructor(){
        this.path = productsFilePath;
    }

    async addUser(data) {
        const { socketId, usuario } = data;
        if (!socketId || !usuario) {
            console.error("Error: falta completar algún campo o un tipo de dato es incorrecto");
            return { status: 'error', message: 'falta completar algún campo o un tipo de dato es incorrecto' };
        }

        const users = await readData(this.path);

        if (!users) {
            return { status: 'error', message: 'No se puede leer el archivo' };
        }

        const newId = users.length > 0 ? Math.max(...users.map(p => Number(p.id))) + 1 : 1;

        const newElement = {
            id: newId,
            socketId,
            usuario
        };

        users.push(newElement);

        await writeData(this.path, users);

        console.log(`JSON Actualizado: Usuario "${socketId}" agregado exitosamente con ID:${newElement.id}`);
        return { status: 'success', element: newElement};
    }

    async getUsers(){
        return await readData(this.path);
    }

    async getUserById(id){
        // console.log(this.products.filter(product => product.id===id)[0]||'No se encontró el producto');
        const users = await readData(this.path);
        const user = users.find(u => u.id === id);
        if(!user){
            console.error(`Error: No se encontró ningún usuario con el ID ${id}.`);
            return null;
        }else{
            return usuario;
        }
    }

    async deleteUser(id) {
        let usuarios = await readData(this.path);
        const initialLength = usuarios.length;

        usuarios = usuarios.filter(p => p.socketId !== id);

        if (usuarios.length === initialLength) {
            console.error(`Error: Usuario con ID: ${id} no encontrado para eliminar.`);
            return { status: 'error', message: 'Error: No se puede eliminar, usuario no encontrado' };
        }

        await writeData(this.path, usuarios);
        console.log(`Usuario con ID: ${id} eliminado correctamente.`);
        return { status: 'success' };
    }

    async clearUsers(){
        await writeData(this.path, []);
        console.log("JSON Actualizado: Users limpiado correctamente.");
        return { status: 'success' };
    }

}