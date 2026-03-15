
const mongoose = require('mongoose');

const EmpleadoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    puesto: { type: String, required: true },
    sueldo_base: { type: Number, required: true } // Cambiado de salario a sueldo_base por día
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);