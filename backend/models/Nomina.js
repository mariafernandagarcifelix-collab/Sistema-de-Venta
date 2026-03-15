
const mongoose = require('mongoose');

const NominaSchema = new mongoose.Schema({
    empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true },
    dias_trabajados: { type: Number, required: true }, // Nuevo campo
    monto: { type: Number, required: true }, // El total calculado
    fecha_pago: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nomina', NominaSchema);