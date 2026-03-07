const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// Registrar una nueva venta
const registrarVenta = async (req, res) => {
    try {
        const { productos } = req.body; // El frontend solo envía un array: [{ producto: "ID", cantidad: 2 }]
        
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

            // Calcular el subtotal real usando el precio de la base de datos
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
                $inc: { stock: -item.cantidad } // $inc con valor negativo resta al stock actual
            });
        }

        // 3. Guardar la venta vinculándola al Cajero que hizo la petición
        const nuevaVenta = new Venta({
            cajero: req.usuario.id, // Viene del token JWT interceptado por el middleware
            productos: productosProcesados,
            total: totalCalculado
        });

        await nuevaVenta.save();
        res.status(201).json({ 
            mensaje: 'Venta registrada exitosamente y stock actualizado', 
            venta: nuevaVenta 
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno al procesar la venta.' });
    }
};

// Obtener todas las ventas (para el historial)
const obtenerVentas = async (req, res) => {
    try {
        // .populate() nos trae los datos legibles del cajero y de los productos en lugar de solo sus IDs
        const ventas = await Venta.find()
            .populate('cajero', 'nombre username')
            .populate('productos.producto', 'nombre categoria')
            .sort({ fecha: -1 }); // De la más reciente a la más antigua
            
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el registro de ventas.' });
    }
};

module.exports = { registrarVenta, obtenerVentas };