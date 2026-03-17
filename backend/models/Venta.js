const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    cajero: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true },
    productos: [{
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        cantidad: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    total: { type: Number, required: true }
});

module.exports = mongoose.model('Venta', ventaSchema);