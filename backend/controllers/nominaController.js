const Nomina = require('../models/Nomina');
const Empleado = require('../models/Empleado');

// Registrar un nuevo pago de nómina
const registrarPago = async (req, res) => {
    try {
        const { empleado, dias_trabajados, monto } = req.body;

        // Verificamos que el empleado exista antes de pagarle
        const empleadoExiste = await Empleado.findById(empleado);
        if (!empleadoExiste) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        const nuevoPago = new Nomina({
            empleado: empleado,
            dias_trabajados: dias_trabajados || 1,
            monto: monto 
        });

        await nuevoPago.save();
        res.status(201).json({ mensaje: 'Pago registrado exitosamente', pago: nuevoPago });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar el pago de nómina.' });
    }
};

// Obtener el historial de pagos (AHORA CON FILTROS Y ZONA HORARIA BLINDADA)
const obtenerHistorialNomina = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, empleadoId } = req.query;
        let filtro = {};

        // Filtro por fechas
        if (fechaInicio || fechaFin) {
            filtro.fecha_pago = {};
            
            if (fechaInicio) {
                // Reemplazamos guiones por diagonales para forzar la hora de México
                const inicioStr = fechaInicio.replace(/-/g, '/');
                const inicio = new Date(inicioStr);
                inicio.setHours(0, 0, 0, 0); 
                filtro.fecha_pago.$gte = inicio;

                // Si solo mandaron fecha de inicio, busca solo en ese día
                if (!fechaFin) {
                    const fin = new Date(inicioStr);
                    fin.setHours(23, 59, 59, 999);
                    filtro.fecha_pago.$lte = fin;
                }
            }
            
            if (fechaFin) {
                const finStr = fechaFin.replace(/-/g, '/');
                const fin = new Date(finStr);
                fin.setHours(23, 59, 59, 999);
                filtro.fecha_pago.$lte = fin;
            }
        }

        // Filtro por empleado
        if (empleadoId) {
            filtro.empleado = empleadoId;
        }

        const historial = await Nomina.find(filtro)
                                      .populate('empleado', 'nombre puesto')
                                      .sort({ fecha_pago: -1 }); 
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de nómina.' });
    }
};

module.exports = { registrarPago, obtenerHistorialNomina };