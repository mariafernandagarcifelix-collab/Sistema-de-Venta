const express = require("express");
const router = express.Router();
const {
  registrarVenta,
  obtenerVentas,
} = require("../controllers/ventaController");

// Importamos nuestro cadenero basado en roles
const { verificarRol } = require("../middlewares/auth");

// Permitimos que tanto Administradores como Cajeros puedan usar la Caja Registradora
router.use(verificarRol(["Administrador", "Cajero"]));


router.post("/", registrarVenta);
router.get("/", obtenerVentas);

module.exports = router;
