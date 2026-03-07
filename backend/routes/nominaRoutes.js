const express = require("express");
const router = express.Router();
const {
  registrarPago,
  obtenerHistorialNomina,
} = require("../controllers/nominaController");
const { verificarUsuarioLocal, verificarRol } = require("../middlewares/auth");

// Protección estricta: Solo Administradores
router.use(verificarUsuarioLocal);
router.use(verificarRol(["Administrador"]));

router.post("/pagar", registrarPago);
router.get("/historial", obtenerHistorialNomina);

module.exports = router;
