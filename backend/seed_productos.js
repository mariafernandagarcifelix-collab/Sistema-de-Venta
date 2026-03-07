// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./models/Producto');

const productosDePrueba = [
    {
        nombre: 'Laptop Dell Inspiron',
        precio: 15000,
        stock: 10,
        categoria: 'Electrónica',
        imagen: 'laptop.jpg' // Asegúrate de tener este archivo en public/img/productos/
    },
    {
        nombre: 'Mouse Inalámbrico Logitech',
        precio: 450,
        stock: 35,
        categoria: 'Accesorios',
        imagen: 'mouse.jpg'
    },
    {
        nombre: 'Teclado Mecánico RGB',
        precio: 1200,
        stock: 15,
        categoria: 'Accesorios',
        imagen: 'teclado.jpg'
    },
    {
        nombre: 'Monitor Samsung 24"',
        precio: 3200,
        stock: 8,
        categoria: 'Electrónica',
        imagen: 'monitor.jpg'
    }
];

const inyectarDatos = async () => {
    try {
        const dbUri = process.env.DB_URI.replace('${SERVER_HOSTNAME}', process.env.SERVER_HOSTNAME || '127.0.0.1');
        await mongoose.connect(dbUri);
        console.log('Conectado a MongoDB para inyección de datos...');

        await Producto.deleteMany(); // Limpia la colección
        console.log('Productos anteriores eliminados.');

        await Producto.insertMany(productosDePrueba);
        console.log('¡Productos inyectados con éxito!');

        process.exit();
    } catch (error) {
        console.error('Error inyectando datos:', error);
        process.exit(1);
    }
};

inyectarDatos();