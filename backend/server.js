// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database.js");

const app = express();

const {
  autenticacionWindows,
  verificarUsuarioLocal,
} = require("./middlewares/auth");

// Conexión a MongoDB
connectDB();

// Middlewares Globales
// Permitir peticiones desde cualquier IP en la red local
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parsear JSON en el body de las peticiones
app.use(express.json());

const path = require("path");

// Exponer la carpeta "public" para que las imágenes sean accesibles en la red local
app.use("/public", express.static(path.join(__dirname, "public")));

// ¡NUEVO! Exponer todo el frontend para evitar errores de CORS al probar localmente
const frontendPath = path.join(__dirname, "../frontend");
console.log("[Static] Servir frontend desde:", frontendPath);
app.use(express.static(frontendPath));

// Log simple de peticiones para diagnóstico
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Logger de accesos (morgan registrará cada petición HTTP en la consola)
app.use(morgan("dev"));

// Protección global de la API: autenticación Windows + verificación en DB.
// Esto aplica a todas las rutas bajo `/api` y debe declararse antes de montar las rutas.
app.use("/api", autenticacionWindows, verificarUsuarioLocal);

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const empleadoRoutes = require("./routes/empleadoRoutes");
const nominaRoutes = require("./routes/nominaRoutes");
const ventaRoutes = require("./routes/ventaRoutes");
const reporteRoutes = require("./routes/reporteRoutes");

// Usar rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/nomina", nominaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/reportes", reporteRoutes);
// Protección por ruta: cada router aplica su propio middleware de autenticación
// (p. ej. `router.use(verificarUsuarioLocal)` en `productoRoutes`).
// Eliminamos la protección global aquí para respetar la protección por ruta.

// Ruta base de prueba
app.get("/api/health", (req, res) => {
  res.status(200).json({
    estado: "OK",
    mensaje: "Servidor POS funcionando en red local",
  });
});

// Fallback 404 para ayudar al diagnóstico
app.use((req, res) => {
  console.log(`[404] Recurso no encontrado: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Not found: ${req.originalUrl}`);
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  // '0.0.0.0' permite que el servidor escuche en todas las interfaces de red,
  // no solo en localhost, permitiendo el acceso de las PCs clientes.
  console.log(`[Servidor] Ejecutándose en puerto ${PORT}`);
  console.log(
    `[Red Local] Los clientes deben acceder vía: http://${process.env.SERVER_HOSTNAME}:${PORT}`,
  );
});
