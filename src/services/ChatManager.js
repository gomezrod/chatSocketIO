import {promises as fs} from 'fs';
import path from 'node:path'

const baseDir = process.cwd();
const dataDir = path.resolve(baseDir, 'db');
const productsFilePath = path.join(dataDir, 'chat.json');

const ensureDataDir = async () => {
    try {
        await fs.mkdir(dataDir, {recursive: true});
        
    } catch(err) {
        console.error("Error creando directorio de datos (chat)");
        
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


export class ChatManager{
    constructor(){
        this.path = productsFilePath;
    }

    async addElement(data){
        const { socketId, mensaje, isLog } = data;
        if (!socketId || !mensaje || typeof(isLog)!=='boolean'){
            console.error("Error: falta completar algún campo o un tipo de dato es incorrecto");
            return { status: 'error', message: 'falta completar algún campo o un tipo de dato es incorrecto' };
        }

        const chat = await readData(this.path);
        
        if(!chat){
            return { status: 'error', message: 'No se puede leer el archivo' };
        }

        const newId = chat.length>0 ? Math.max(...chat.map(p=>Number(p.id))) + 1 : 1;

        const newElement = {
            id: newId,
            socketId,
            mensaje,
            isLog
        };

        chat.push(newElement);
        
        await writeData(this.path, chat);
        
        console.log(`JSON Actualizado: Chat "${socketId}" agregado exitosamente con ID:${newElement.id}`);
        return { status: 'success', element: newElement };
    }

    async getChat(){
        return await readData(this.path);
    }

    async clearChat() {
        await writeData(this.path, []);
        console.log("JSON Actualizado: Chat limpiado correctamente.");
        return { status: 'success' };
    }

}