console.log('usando sockets');
const socket = io();

const entrada = document.querySelector('#entrada');
const usuariosOnline = document.querySelector('#usuariosOnline');
const mensajes = document.querySelector('#mensajes');
const cantidadOnline = document.querySelector('#cantidadOnline');

let nombre = '';
const teclaEnviar = 'Enter';

// socket.emit('msg', 'Hola desde el cliente con Socket.io');

// socket.on('rsp', (data) => {
//     console.log('Respuesta del servidor: ', data);
// });

// if(!localStorage.getItem('nombre')){
    Swal.fire({
        title: '¿Cuál es tu nombre?',
        input: 'text',
        text: 'Ingresá tu nombre y empezá a chatear',
        inputValidator: (value) => {
            return !value && '¡Necesitás un nombre para poder chatear!'
        },
        allowOutsideClick: false
    }).then( nick => {
        nombre = nick.value;
        socket.emit('login', nombre);
        // localStorage.setItem('nombre', nombre);
    })
// } else{
//     nombre = localStorage.getItem('nombre');
//     socket.emit('login', nombre);
// }

socket.on('listaUsuarios', data => {
    const listaUsuarios = data.map( u => `<li>${u.usuario}</li>`).join('');
    usuariosOnline.innerHTML = listaUsuarios;
    cantidadOnline.innerText = `(${data.length})`;
});

entrada.addEventListener('keyup', e => {
    const {key, target} = e;
    if(key === teclaEnviar && target.value!=''){
        const mensaje = entrada.value;
        const mensajeCompleto = {nombre: nombre, mensaje: mensaje};
        socket.emit('msg', mensajeCompleto);
        entrada.value = '';
    }
});

socket.on('rsp', data => {
    const listaMensajes = data.map( m => {
        if(m.isLog){
            return `<i>${m.mensaje.nombre}${m.mensaje.mensaje}</i>`;
        }else{
            return `<b>${m.mensaje.nombre}</b>: ${m.mensaje.mensaje}`;
        }
    }).join('<br/><br/>');
    mensajes.innerHTML = listaMensajes;
});
