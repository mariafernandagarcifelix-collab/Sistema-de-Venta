const express = require("express");
const router = express.Router();
const {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");
const { verificarUsuarioLocal, verificarRol } = require("../middlewares/auth");

// Todas las rutas de productos requieren estar logueado (verificado en la DB)
router.use(verificarUsuarioLocal);

// Cajeros y Administradores pueden ver el inventario
router.get("/", obtenerProductos);

// Solo el Administrador puede crear, editar o eliminar productos
router.post("/", verificarRol(["Administrador"]), crearProducto);
router.put("/:id", verificarRol(["Administrador"]), actualizarProducto);
router.delete("/:id", verificarRol(["Administrador"]), eliminarProducto);

module.exports = router;
