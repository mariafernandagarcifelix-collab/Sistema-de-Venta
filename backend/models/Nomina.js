// backend/models/Nomina.js
const mongoose = require('mongoose');

const nominaSchema = new mongoose.Schema({
    empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true },
    fecha_pago: { type: Date, default: Date.now },
    monto: { type: Number, required: true }
});

module.exports = mongoose.model('Nomina', nominaSchema);