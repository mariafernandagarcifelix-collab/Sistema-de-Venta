// backend/models/Empleado.js
const mongoose = require('mongoose');

const empleadoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    puesto: { type: String, required: true },
    salario: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Empleado', empleadoSchema);