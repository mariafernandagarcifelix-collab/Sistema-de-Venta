const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario'); // <--- ¡NUEVO! Importamos Usuario para buscar al cajero

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

        // 3. LA MAGIA DEL SSO: Buscar el ID del cajero basado en su Gafete de Windows
        const windowsUser = req.sso.user.name;
        const cajeroDB = await Usuario.findOne({ username: windowsUser });

        if (!cajeroDB) {
            return res.status(403).json({ error: 'Error: El cajero no está registrado en la base de datos.' });
        }

        // 4. Guardar la venta vinculándola al _id real de MongoDB
        const nuevaVenta = new Venta({
            cajero: cajeroDB._id, // Ahora viene de la búsqueda que acabamos de hacer
            productos: productosProcesados,
            total: totalCalculado
        });

        await nuevaVenta.save();
        res.status(201).json({ 
            mensaje: 'Venta registrada exitosamente y stock actualizado', 
            venta: nuevaVenta 
        });

    } catch (error) {
        console.error('[Error Venta]:', error); // Excelente para diagnosticar si algo falla en tu consola
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