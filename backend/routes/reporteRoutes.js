const express = require('express');
const router = express.Router();

// 1. Importamos todas las funciones de un solo golpe
const { ventasPorDia, productosMasVendidos, resumenDashboard } = require('../controllers/reporteController');
const { verificarRol } = require('../middlewares/auth');

// 2. RUTA GENERAL (El Dashboard)
// Esta ruta va arriba para que todos los que inicien sesión (Cajeros y Admins) puedan ver la pantalla de Inicio
router.get('/resumen', resumenDashboard);

// 3. RUTAS PROTEGIDAS (Las gráficas)
// El "Cadenero" entra en acción: A partir de esta línea, todo exige ser Administrador
router.use(verificarRol(['Administrador']));

router.get('/ventas-dia', ventasPorDia);
router.get('/top-productos', productosMasVendidos);

module.exports = router;