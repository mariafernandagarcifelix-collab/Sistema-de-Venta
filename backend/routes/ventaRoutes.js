const express = require("express");
const router = express.Router();
const {
  registrarVenta,
  obtenerVentas,
} = require("../controllers/ventaController");
const { verificarUsuarioLocal } = require("../middlewares/auth");

// Todas las rutas de ventas requieren que el usuario esté logueado
router.use(verificarUsuarioLocal);

// Cualquier usuario logueado (Cajero o Admin) puede registrar ventas y ver el historial
router.post("/", registrarVenta);
router.get("/", obtenerVentas);

module.exports = router;
