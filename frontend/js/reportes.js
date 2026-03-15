// Variables globales para las gráficas (para poder destruirlas y redibujarlas sin que se encimen)
let chartVentas = null;
let chartProductos = null;

// ==========================================
// 1. LÓGICA DE LAS GRÁFICAS (CHART.JS)
// ==========================================
async function cargarGraficaVentas() {
    try {
        const datos = await fetchAPI('/reportes/ventas-dia');
        
        // Volteamos el arreglo para que las fechas más antiguas queden a la izquierda en la gráfica
        const datosOrdenados = datos.reverse(); 

        const labels = datosOrdenados.map(d => d._id);
        const values = datosOrdenados.map(d => d.totalIngresos);

        const ctx = document.getElementById('graficoVentas').getContext('2d');
        
        // Si ya existía una gráfica, la destruimos antes de crear la nueva
        if (chartVentas) chartVentas.destroy();

        chartVentas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ingresos ($)',
                    data: values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4 // Hace que la línea sea curva y elegante
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (error) {
        console.error('Error al cargar gráfica de ventas:', error);
    }
}

async function cargarGraficaProductos() {
    try {
        const datos = await fetchAPI('/reportes/top-productos');
        
        const labels = datos.map(d => d.nombreProducto);
        const values = datos.map(d => d.cantidadVendida);

        const ctx = document.getElementById('graficoProductos').getContext('2d');
        
        if (chartProductos) chartProductos.destroy();

        chartProductos = new Chart(ctx, {
            type: 'doughnut', // Gráfica de dona
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    } catch (error) {
        console.error('Error al cargar gráfica de productos:', error);
    }
}


// ==========================================
// 2. LÓGICA DE LA TABLA Y FILTROS
// ==========================================

// Esta es la función principal que se llama al dar clic en el menú
async function cargarReportes() {
    // 1. Dibujar las gráficas
    cargarGraficaVentas(); 
    cargarGraficaProductos(); 

    // 2. Llenar el select de productos para poder filtrar
    try {
        const productos = await fetchAPI('/productos');
        const select = document.getElementById('filtro-producto');
        select.innerHTML = '<option value="">Todos los productos...</option>';
        productos.forEach(p => {
            select.innerHTML += `<option value="${p._id}">${p.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar productos para el filtro:", error);
    }

    // 3. Cargar la tabla por primera vez (sin filtros, muestra todo)
    buscarVentas();
}

// Evento: Cuando el usuario presiona el botón de la lupa
document.getElementById('form-filtros').addEventListener('submit', (e) => {
    e.preventDefault();
    buscarVentas();
});

// Evento: Cuando el usuario presiona el borrador
function limpiarFiltros() {
    document.getElementById('form-filtros').reset();
    buscarVentas(); // Vuelve a buscar sin filtros
}

// Función que busca las ventas en la base de datos y dibuja la tabla
async function buscarVentas() {
    const fInicio = document.getElementById('filtro-inicio').value;
    const fFin = document.getElementById('filtro-fin').value;
    const prod = document.getElementById('filtro-producto').value;

    // Construimos la URL con los parámetros que el usuario eligió
    let query = '?';
    if(fInicio) query += `fechaInicio=${fInicio}&`;
    if(fFin) query += `fechaFin=${fFin}&`;
    if(prod) query += `productoId=${prod}`;

    try {
        const ventas = await fetchAPI(`/reportes/historial${query}`);
        const tbody = document.getElementById('historial-ventas-body');
        tbody.innerHTML = '';

        if(ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-white py-4"><i class="fa-solid fa-folder-open fa-2x mb-2 text-muted"></i><br>No se encontraron ventas con esos filtros.</td></tr>';
            return;
        }

        ventas.forEach(v => {
            // Formatear la fecha para que se vea bonita (ej. 13/03/2026, 14:30)
            const date = new Date(v.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
            
            // Unir todos los productos de esa venta en una sola celda
            const prodsTxt = v.productos.map(p => `${p.producto ? p.producto.nombre : 'Producto Borrado'} (x${p.cantidad})`).join('<br>');
            
            // Inyectar la fila (le puse text-white para que se vea bien en tu Dark Mode)
            tbody.innerHTML += `
                <tr>
                    <td><span class="badge bg-secondary">${date}</span></td>
                    <td class="text-white"><i class="fa-solid fa-user text-primary"></i> ${v.cajero ? v.cajero.nombre : 'Usuario de Windows'}</td>
                    <td class="text-white"><small>${prodsTxt}</small></td>
                    <td class="fw-bold text-success">$${v.total.toFixed(2)}</td>
                </tr>
            `;
        });
    } catch (e) { 
        UI.toast('error', 'Error al cargar el historial de ventas'); 
    }
}