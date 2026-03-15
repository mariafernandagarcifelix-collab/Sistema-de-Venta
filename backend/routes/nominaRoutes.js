const express = require("express");
const router = express.Router();
const {
  registrarPago,
  obtenerHistorialNomina,
} = require("../controllers/nominaController");

// Solo importamos verificarRol
const { verificarRol } = require("../middlewares/auth");

// Protección estricta: Solo Administradores
router.use(verificarRol(["Administrador"]));

// Tu nuevo frontend hace un POST directamente a '/' para pagar
router.post("/", registrarPago);
router.get("/", obtenerHistorialNomina);

module.exports = router;