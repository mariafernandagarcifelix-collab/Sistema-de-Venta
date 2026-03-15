const express = require("express");
const router = express.Router();

// 1. Importamos todas las funciones, incluyendo la nueva de abastecer
const {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  abastecerProducto
} = require("../controllers/productoController");

const { verificarRol } = require("../middlewares/auth");

// 2. Aplicamos el "Cadenero" general para estas rutas.
// Al poner ['Administrador', 'Cajero'] aquí arriba, les damos acceso total a ambos
router.use(verificarRol(["Administrador", "Cajero"]));

// 3. Definimos las rutas (ya no necesitan verificar el rol individualmente)
router.get("/", obtenerProductos);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);
router.patch("/:id/abastecer", abastecerProducto);

module.exports = router;
