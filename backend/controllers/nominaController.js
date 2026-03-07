const Nomina = require('../models/Nomina');
const Empleado = require('../models/Empleado');

// Registrar un nuevo pago de nómina
const registrarPago = async (req, res) => {
    try {
        const { empleado_id, monto } = req.body;

        // Verificamos que el empleado exista antes de pagarle
        const empleadoExiste = await Empleado.findById(empleado_id);
        if (!empleadoExiste) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        const nuevoPago = new Nomina({
            empleado: empleado_id,
            monto: monto || empleadoExiste.salario // Si no envían monto, toma el salario base
        });

        await nuevoPago.save();
        res.status(201).json({ mensaje: 'Pago registrado exitosamente', pago: nuevoPago });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar el pago de nómina.' });
    }
};

// Obtener el historial de pagos (con los datos del empleado incluidos)
const obtenerHistorialNomina = async (req, res) => {
    try {
        // Usamos .populate() para traer el nombre y puesto del empleado, no solo su ID
        const historial = await Nomina.find()
                                      .populate('empleado', 'nombre puesto')
                                      .sort({ fecha_pago: -1 }); // Ordenar del más reciente al más antiguo
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de nómina.' });
    }
};

module.exports = { registrarPago, obtenerHistorialNomina };