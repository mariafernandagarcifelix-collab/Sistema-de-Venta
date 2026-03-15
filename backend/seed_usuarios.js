// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// Importamos todos los modelos necesarios
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario'); 
const Empleado = require('./models/Empleado'); 
const Nomina = require('./models/Nomina');     
const Venta = require('./models/Venta');       

// 1. Define aquí los usuarios EXACTAMENTE como inician sesión en Windows Server
const usuariosDePrueba = [
    {
        nombre: 'Fernanda',
        username: 'maria', 
        rol: 'Administrador' 
    },
    {
        nombre: 'Fernanda (Admin Redes)',
        username: 'User11', 
        rol: 'Administrador'
    },
    {
        nombre: 'Cajero Principal',
        username: 'User8', 
        rol: 'Cajero'
    },
    {
        nombre: 'Cajero Secundario',
        username: 'User10', 
        rol: 'Cajero'
    }
];

// 2. Reutilizamos los productos que ya tenías con sus imágenes
const productosDePrueba = [
    { nombre: 'Laptop HP 15.6', precio: 15000, stock: 10, categoria: 'Electrónica', imagen: 'laptop.png' },
    { nombre: 'Mouse Inalámbrico Logitech', precio: 450, stock: 35, categoria: 'Accesorios', imagen: 'mouse.png' },
    { nombre: 'Teclado Mecánico RGB', precio: 1200, stock: 15, categoria: 'Accesorios', imagen: 'teclado.png' },
    { nombre: 'Monitor Samsung 24"', precio: 3200, stock: 8, categoria: 'Electrónica', imagen: 'monitor.png' },
    { nombre: 'Audífonos Gamer HyperX', precio: 1800, stock: 20, categoria: 'Accesorios', imagen: 'audifonos.png' },
    { nombre: 'Memoria RAM Corsair 16GB', precio: 1500, stock: 25, categoria: 'Componentes', imagen: 'ram.png' },
    { nombre: 'Unidad SSD 1TB Kingston', precio: 2100, stock: 30, categoria: 'Componentes', imagen: 'ssd.png' },
    { nombre: 'Silla Gamer Ergonómica', precio: 4500, stock: 5, categoria: 'Mobiliario', imagen: 'silla.png' },
    { nombre: 'Impresora Multifuncional HP', precio: 3800, stock: 12, categoria: 'Oficina', imagen: 'impresora.png' }
];

const inyectarDatosMasivos = async () => {
    try {
        // Conexión a MongoDB
        const dbUri = process.env.DB_URI.replace('${SERVER_HOSTNAME}', process.env.SERVER_HOSTNAME || '127.0.0.1');
        await mongoose.connect(dbUri);
        console.log('✅ Conectado a MongoDB...');

        // Limpiamos TODAS las colecciones para empezar en blanco sin dejar rastro de pruebas anteriores
        await Promise.all([
            Usuario.deleteMany(), 
            Producto.deleteMany(), 
            Empleado.deleteMany(), 
            Nomina.deleteMany(), 
            Venta.deleteMany()
        ]);
        console.log('🧹 Base de datos limpiada.');

        // Insertamos los datos base y guardamos sus IDs para usarlos en los historiales
        const prodsDb = await Producto.insertMany(productosDePrueba);
        const usersDb = await Usuario.insertMany(usuariosDePrueba);
        
        // 3. Crear Empleados
        const empDb = await Empleado.insertMany([
            { nombre: 'Roberto Gómez', puesto: 'Cajero Principal', salario: 6000 },
            { nombre: 'Ana Silvia', puesto: 'Gerente de Tienda', salario: 12000 },
            { nombre: 'Carlos Ruiz', puesto: 'Soporte Técnico', salario: 4500 }
        ]);

        // 4. Generar Historial de Nómina (Meses anteriores)
        const nominas = [];
        for (let emp of empDb) {
            nominas.push({ empleado: emp._id, monto: emp.salario, fecha_pago: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }); // Hace 2 meses
            nominas.push({ empleado: emp._id, monto: emp.salario, fecha_pago: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }); // Hace 1 mes
            nominas.push({ empleado: emp._id, monto: emp.salario + 500, fecha_pago: new Date() }); // Hoy (con bono)
        }
        await Nomina.insertMany(nominas);

        // 5. Generar Historial de Ventas (Para que las gráficas se vean geniales)
        const ventas = [];
        // Creamos ventas simuladas de hace 0, 1, 2, 3, 4 y 5 días
        const diasAtras = [5, 4, 3, 3, 2, 1, 1, 1, 0, 0]; 
        
        for (let dias of diasAtras) {
            // Elegir dos productos al azar para esta venta simulada
            const p1 = prodsDb[Math.floor(Math.random() * prodsDb.length)];
            const p2 = prodsDb[Math.floor(Math.random() * prodsDb.length)];
            
            const cant1 = Math.floor(Math.random() * 3) + 1; // 1 a 3 items
            const cant2 = 1;

            ventas.push({
                cajero: usersDb[0]._id, // Se registrarán a nombre del primer usuario (maria)
                fecha: new Date(Date.now() - dias * 24 * 60 * 60 * 1000), // Restamos días a la fecha de hoy
                total: (p1.precio * cant1) + (p2.precio * cant2),
                productos: [
                    { producto: p1._id, cantidad: cant1, subtotal: p1.precio * cant1 },
                    { producto: p2._id, cantidad: cant2, subtotal: p2.precio * cant2 }
                ]
            });
        }
        await Venta.insertMany(ventas);

        console.log('🚀 ¡Datos simulados generados con éxito!');
        console.log('--------------------------------------------------');
        console.log('Usuarios autorizados para acceder por Windows:');
        usuariosDePrueba.forEach(u => console.log(`- ${u.username} (${u.rol})`));
        console.log('--------------------------------------------------');
        console.log(`📊 Se inyectaron: ${prodsDb.length} productos, ${empDb.length} empleados, ${nominas.length} pagos y ${ventas.length} ventas de historial.`);

        process.exit();
    } catch (error) {
        console.error('❌ Error inyectando datos:', error);
        process.exit(1);
    }
};

inyectarDatosMasivos();