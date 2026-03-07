// frontend/js/reportes.js

// Variables globales para guardar la instancia de los gráficos y poder destruirlos al recargar
let chartVentas = null;
let chartProductos = null;

async function cargarReportes() {
    try {
        // Hacemos las peticiones en paralelo para que cargue más rápido
        const [ventasData, productosData] = await Promise.all([
            fetchAPI('/reportes/ventas-dia'),
            fetchAPI('/reportes/top-productos')
        ]);

        dibujarGraficoVentas(ventasData);
        dibujarGraficoProductos(productosData);

    } catch (error) {
        console.error('Error al cargar los reportes:', error);
        alert('No se pudieron cargar las estadísticas.');
    }
}

function dibujarGraficoVentas(datos) {
    const ctx = document.getElementById('graficoVentas').getContext('2d');
    
    // Si ya existe un gráfico previo, lo destruimos para no encimar los datos
    if (chartVentas) {
        chartVentas.destroy();
    }

    // Chart.js necesita arrays separados para las etiquetas (eje X) y los valores (eje Y)
    // Usamos .reverse() porque el backend nos manda del más nuevo al más viejo, 
    // y en la gráfica queremos ver el progreso de izquierda a derecha.
    const etiquetas = datos.map(item => item._id).reverse();
    const ingresos = datos.map(item => item.totalIngresos).reverse();

    chartVentas = new Chart(ctx, {
        type: 'bar', // Gráfico de barras
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Ingresos Diarios ($)',
                data: ingresos,
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Azul secundario con transparencia
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function dibujarGraficoProductos(datos) {
    const ctx = document.getElementById('graficoProductos').getContext('2d');
    
    if (chartProductos) {
        chartProductos.destroy();
    }

    const etiquetas = datos.map(item => item.nombreProducto);
    const cantidades = datos.map(item => item.cantidadVendida);

    chartProductos = new Chart(ctx, {
        type: 'doughnut', // Gráfico de dona
        data: {
            labels: etiquetas,
            datasets: [{
                data: cantidades,
                backgroundColor: [
                    '#ef4444', // Rojo
                    '#3b82f6', // Azul
                    '#10b981', // Verde
                    '#f59e0b', // Amarillo
                    '#8b5cf6'  // Morado
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}