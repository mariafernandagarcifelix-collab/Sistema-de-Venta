const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categoria: { type: String, required: true },
    imagen: { type: String, default: 'default.jpg' },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);