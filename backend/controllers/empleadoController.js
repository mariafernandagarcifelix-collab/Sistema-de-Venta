const Empleado = require('../models/Empleado');

// Obtener todos los empleados
const obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la lista de empleados.' });
    }
};

// Registrar un nuevo empleado
const crearEmpleado = async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.status(201).json(nuevoEmpleado);
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar el empleado. Faltan datos.' });
    }
};

// Actualizar datos de un empleado (ej. aumento de salario o cambio de puesto)
const actualizarEmpleado = async (req, res) => {
    try {
        const empleadoActualizado = await Empleado.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(empleadoActualizado);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar al empleado.' });
    }
};

// Eliminar un empleado
const eliminarEmpleado = async (req, res) => {
    try {
        await Empleado.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Empleado eliminado correctamente del sistema.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar al empleado.' });
    }
};


module.exports = { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado };