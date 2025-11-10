import { Router } from "express";

const router = Router();


router.get('/perfil', (req, res) => {
    res.render('perfil', {
        name: process.cwd(),
        title: 'Handlebars',
        body: '<h1>Hola Handlebars</h1>'
    })
})

router.get('/chat', (req, res) => {
    res.render('chat', {
        title: 'Chat con Socket.io'
    })
});

router.get('/', (req, res) => {
    res.status(200).send('Bienvenido a la vista principal');
});

export default router;