import express from 'express';
import viewRouter from './routes/view.router.js'
import path from 'node:path';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import http from 'http';
import { ChatManager } from './services/ChatManager.js';
import { UsersManager } from './services/UsersManager.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.engine('handlebars', handlebars.engine());
app.set('views', path.join(process.cwd(), '/src/views'));
app.set('view engine', 'handlebars');

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(process.cwd(),'src','public')));

app.use('/', viewRouter);

const chatManager = new ChatManager();
const usersManager = new UsersManager();
// const historialMensajes = [];
// const usuariosOnline = [];

app.get('/', (req, res) => {
    res.status(200).send('Bienvenido! Server de prueba Curso Coderhouse Backend I');
});

 const serverHttp = app.listen(PORT, () => {
    console.log(`Server ejecutándose en http://localhost:${PORT}`); 
});

const serverSocket = new Server(serverHttp);

serverSocket.on('connection', (socket) => {
    console.log('Cliente conectado con Socket.io - ', socket.id);
    // serverSocket.emit('listaUsuarios', usuariosOnline);
    
    socket.on('login', (data) => {
        // if(usuariosOnline.find(u => u.socketId === socket.id)) {
        //     return;
        // }
        // usuariosOnline.push({socketId: socket.id, usuario: data});
        usersManager.getUsers().then(res => {
            if(res.find(u => u.socketId === socket.id)) {
                return;
            }
            usersManager.addUser({socketId: socket.id, usuario: data})
            .then(() => {
                usersManager.getUsers().then(res => {
                    serverSocket.emit('listaUsuarios', res);
                });
            });
        // historialMensajes.push({socketId: socket.id, mensaje:{nombre: data, mensaje:' ingresó al chat'}, isLog: true});
            chatManager.addElement({socketId: socket.id, mensaje:{nombre: data, mensaje:' ingresó al chat'}, isLog: true})
            .then(() => {
                chatManager.getChat()
                .then(res => {
                    serverSocket.emit('rsp', res);
                });
            });
        });
    });

    socket.on('msg', (data) => {
        console.log(`Mensaje desde el cliente: ${socket.id}`, data);
        // historialMensajes.push({socketId: socket.id, mensaje: data, isLog: false});
        if(data.mensaje === '/clear'){ //Acá Obviamente tendría que haber alguna verificación de permisos o algo así
            chatManager.clearChat().then(() => {
                console.log('Chat vaciado por comando /clear');
            });
            chatManager.getChat()
                .then(res => {
                    serverSocket.emit('rsp', res);
                });
            return;
        }
        chatManager.addElement({socketId: socket.id, mensaje: data, isLog: false})
        .then(() => {
            chatManager.getChat()
            .then(res => {
                serverSocket.emit('rsp', res);
            });
        });
        // serverSocket.emit('rsp', historialMensajes)
    });

    socket.on('disconnect', (reason) => {
        console.log('Cliente desconectado: ', socket.id);
        console.log('Reason of disconnection: ', reason);
        
        usersManager.getUsers().then(res => {
            const index = res.findIndex(u => u.socketId === socket.id);
            serverSocket.emit('listaUsuarios', res);
            console.log('mensaje leido de bbdd A BORRAR');

            if (index !== -1) {
                const userOff = (res[index].usuario);

                // historialMensajes.push({ socketId: socket.id, mensaje: { nombre: userOff, mensaje: ' abandonó al chat' }, isLog: true });
                chatManager.addElement({ socketId: socket.id, mensaje: { nombre: userOff, mensaje: ' abandonó al chat' }, isLog: true })
                .then(() => {
                    chatManager.getChat()
                    .then(res => {
                        serverSocket.emit('rsp', res);
                    });
                });
                usersManager.deleteUser(res[index].socketId)
                .then(() => {
                    usersManager.getUsers()
                    .then(res => {
                        serverSocket.emit('listaUsuarios', res);
                        console.log('usuario elminiado');
                        
                    });
                });
            }
        });
        
    });
});

