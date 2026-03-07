// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Reemplazamos dinámicamente el hostname si se está inyectando desde el .env
        const dbUri = process.env.DB_URI.replace('${SERVER_HOSTNAME}', process.env.SERVER_HOSTNAME || '192.168.1.10');
        
        await mongoose.connect(dbUri);
        console.log(`[Base de Datos] Conectada exitosamente a MongoDB en el host: ${process.env.SERVER_HOSTNAME}`);
    } catch (error) {
        console.error(`[Error de Base de Datos] Falla en la conexión: ${error.message}`);
        process.exit(1); // Detiene la app si no hay BD
    }
};

module.exports = connectDB;