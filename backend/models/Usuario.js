const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // Este debe ser EXACTAMENTE el nombre de usuario de Windows
    rol: { type: String, enum: ['Administrador', 'Cajero'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);