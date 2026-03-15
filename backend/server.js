// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database.js");

const app = express();

// 1. IMPORTAMOS EL NUEVO ESCÁNER SSO (node-expose-sspi)
const { ssoMiddleware } = require("./middlewares/auth");

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

const opcionesCors = {
    // Pon aquí todas las formas en las que las compus podrían llamar al servidor
    origin: [
        'http://localhost:3000', 
        'http://www.cuadras.com', 
        'http://www.cuadras.com:3000',
        'http://192.168.1.50', // Reemplaza con la IP real del servidor de Carlos
        'http://192.168.1.50:3000'
    ],
    credentials: true // VITAL: Si esto no está en true, el Active Directory no funciona en red
};
app.use(cors(opcionesCors));

// Parsear JSON en el body de las peticiones
app.use(express.json());

const path = require("path");

// Exponer la carpeta "public" para que las imágenes sean accesibles en la red local
app.use("/public", express.static(path.join(__dirname, "public")));

// Exponer todo el frontend para evitar errores de CORS al probar localmente
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

// --- RUTA PÚBLICA DE DIAGNÓSTICO ---
// La ponemos ANTES del SSO para que responda sin pedir sesión de Windows
app.get("/api/health", (req, res) => {
  res.status(200).json({
    estado: "OK",
    mensaje: "Servidor POS funcionando en red local",
  });
});

// --- PROTECCIÓN GLOBAL DE LA API ---
// 2. CONECTAMOS EL NUEVO ESCÁNER SSO A TODAS LAS RUTAS
app.use("/api", ssoMiddleware);

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
