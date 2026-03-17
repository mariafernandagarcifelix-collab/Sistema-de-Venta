const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Empleado = require('../models/Empleado'); // <--- CAMBIO 1: Importamos Empleado en lugar de Usuario

// Registrar una nueva venta
const registrarVenta = async (req, res) => {
    try {
        const { productos } = req.body; 
        
        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'La venta debe incluir al menos un producto.' });
        }

        let totalCalculado = 0;
        const productosProcesados = [];

        // 1. Validar stock y calcular total real
        for (let item of productos) {
            const productoDB = await Producto.findById(item.producto);
            
            if (!productoDB) {
                return res.status(404).json({ error: `Producto con ID ${item.producto} no encontrado.` });
            }

            if (!productoDB.activo) {
                return res.status(400).json({ error: `El producto ${productoDB.nombre} está desactivado.` });
            }

            if (productoDB.stock < item.cantidad) {
                return res.status(400).json({ 
                    error: `Stock insuficiente para ${productoDB.nombre}. Disponible: ${productoDB.stock}` 
                });
            }

            const subtotal = productoDB.precio * item.cantidad;
            totalCalculado += subtotal;

            productosProcesados.push({
                producto: productoDB._id,
                cantidad: item.cantidad,
                subtotal: subtotal
            });
        }

        // 2. Descontar el stock de la base de datos
        for (let item of productosProcesados) {
            await Producto.findByIdAndUpdate(item.producto, {
                $inc: { stock: -item.cantidad }
            });
        }

        // 3. LA MAGIA DEL SSO (CORREGIDA): 
        // Usamos req.usuario.nombre que ya viene limpio del middleware de auth
        const windowsUser = req.usuario.nombre; 
        
        // CAMBIO 2: Buscamos en la colección de Empleado por el campo 'nombre'
        const cajeroDB = await Empleado.findOne({ nombre: windowsUser });

        if (!cajeroDB) {
            return res.status(403).json({ 
                error: `Error: El cajero [${windowsUser}] no está registrado en la plantilla de Empleados.` 
            });
        }

        // 4. Guardar la venta vinculándola al _id real del Empleado
        const nuevaVenta = new Venta({
            cajero: cajeroDB._id, 
            productos: productosProcesados,
            total: totalCalculado
        });

        await nuevaVenta.save();
        res.status(201).json({ 
            mensaje: 'Venta registrada exitosamente', 
            venta: nuevaVenta 
        });

    } catch (error) {
        console.error('[Error Venta]:', error);
        res.status(500).json({ error: 'Error interno al procesar la venta.' });
    }
};

// Obtener todas las ventas (para el historial)
const obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.find()
            // CAMBIO 3: Asegúrate de que el modelo Venta use ref: 'Empleado' 
            // para que este populate funcione y te traiga el nombre real
            .populate('cajero', 'nombre puesto') 
            .populate('productos.producto', 'nombre categoria')
            .sort({ fecha: -1 });
            
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el registro de ventas.' });
    }
};

module.exports = { registrarVenta, obtenerVentas };