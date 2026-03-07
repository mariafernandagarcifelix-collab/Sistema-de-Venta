const Producto = require('../models/Producto');

// Obtener todos los productos activos
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find({ activo: true });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el inventario.' });
    }
};

// Crear un nuevo producto
const crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el producto. Verifica los datos.' });
    }
};

// Actualizar un producto (ej. modificar stock o precio)
const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Devuelve el documento actualizado
        );
        res.json(productoActualizado);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el producto.' });
    }
};

// Eliminación lógica (desactivar producto para no perder historial de ventas)
const eliminarProducto = async (req, res) => {
    try {
        await Producto.findByIdAndUpdate(req.params.id, { activo: false });
        res.json({ mensaje: 'Producto desactivado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };