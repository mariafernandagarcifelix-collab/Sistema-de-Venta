const express = require("express");
const router = express.Router();
const {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} = require("../controllers/empleadoController");

// Solo importamos verificarRol
const { verificarRol } = require("../middlewares/auth");

// Bloqueo absoluto para Cajeros
router.use(verificarRol(["Administrador"])); 

router.get("/", obtenerEmpleados);
router.post("/", crearEmpleado);
router.put("/:id", actualizarEmpleado);
router.delete("/:id", eliminarEmpleado);

module.exports = router;
