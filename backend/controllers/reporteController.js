const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// 1. Reporte: Ventas por Día
const ventasPorDia = async (req, res) => {
    try {
        const reporte = await Venta.aggregate([
            {
                // Agrupamos por la fecha formateada a Año-Mes-Día
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
                    totalIngresos: { $sum: "$total" },
                    numeroVentas: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } } // Ordenamos de la fecha más reciente a la más antigua
        ]);
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de ventas por día.' });
    }
};

// 2. Reporte: Ventas por Mes
const ventasPorMes = async (req, res) => {
    try {
        const reporte = await Venta.aggregate([
            {
                // Agrupamos por la fecha formateada a Año-Mes
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$fecha" } },
                    totalIngresos: { $sum: "$total" },
                    numeroVentas: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } } 
        ]);
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de ventas por mes.' });
    }
};

// 3. Reporte: Top Productos más vendidos
const productosMasVendidos = async (req, res) => {
    try {
        const reporte = await Venta.aggregate([
            { $unwind: "$productos" }, // Desglosa el array de productos de cada venta
            {
                $group: {
                    _id: "$productos.producto", // Agrupa por el ID del producto
                    cantidadVendida: { $sum: "$productos.cantidad" },
                    ingresosGenerados: { $sum: "$productos.subtotal" }
                }
            },
            { $sort: { cantidadVendida: -1 } }, // Ordena por los que más se vendieron
            { $limit: 5 }, // Nos quedamos solo con el Top 5
            {
                // Hacemos un "JOIN" con la colección de productos para traer el nombre
                $lookup: {
                    from: "productos", // Nombre de la colección en minúsculas y plural
                    localField: "_id",
                    foreignField: "_id",
                    as: "datosProducto"
                }
            },
            { $unwind: "$datosProducto" }, // Quitamos el formato de array que deja lookup
            {
                // Formateamos la salida final
                $project: {
                    _id: 0,
                    nombreProducto: "$datosProducto.nombre",
                    cantidadVendida: 1,
                    ingresosGenerados: 1
                }
            }
        ]);
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el reporte de productos más vendidos.' });
    }
};

module.exports = { ventasPorDia, ventasPorMes, productosMasVendidos };