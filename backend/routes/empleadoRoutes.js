const express = require("express");
const router = express.Router();
const {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} = require("../controllers/empleadoController");
const { verificarUsuarioLocal, verificarRol } = require("../middlewares/auth");

// Protegemos TODAS las rutas de este archivo
router.use(verificarUsuarioLocal);
router.use(verificarRol(["Administrador"])); // Bloqueo absoluto para Cajeros

router.get("/", obtenerEmpleados);
router.post("/", crearEmpleado);
router.put("/:id", actualizarEmpleado);
router.delete("/:id", eliminarEmpleado);

module.exports = router;
