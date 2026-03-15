const express = require('express');
const router = express.Router();

// 1. Importamos todas las funciones (¡Ya incluimos obtenerHistorialVentas!)
const { 
    ventasPorDia, 
    productosMasVendidos, 
    resumenDashboard,
    obtenerHistorialVentas // <--- Añadido aquí
} = require('../controllers/reporteController');

const { verificarRol } = require('../middlewares/auth');

// 2. RUTA GENERAL (El Dashboard)
// Esta ruta va arriba para que todos los que inicien sesión puedan ver la pantalla de Inicio
router.get('/resumen', resumenDashboard);

// 3. RUTAS PROTEGIDAS (Las gráficas y el historial)
// Modificamos el arreglo para dar acceso tanto a Administradores como a Cajeros
router.use(verificarRol(['Administrador', 'Cajero']));

router.get('/ventas-dia', ventasPorDia);
router.get('/top-productos', productosMasVendidos);
router.get('/historial', obtenerHistorialVentas);

module.exports = router;