const express = require("express");
const router = express.Router();
const {
  ventasPorDia,
  ventasPorMes,
  productosMasVendidos,
} = require("../controllers/reporteController");
const { verificarUsuarioLocal } = require("../middlewares/auth");

// Protegemos las rutas para que solo usuarios logueados (Cajeros o Admins) puedan ver los reportes
router.use(verificarUsuarioLocal);

router.get("/ventas-dia", ventasPorDia);
router.get("/ventas-mes", ventasPorMes);
router.get("/top-productos", productosMasVendidos);

module.exports = router;
