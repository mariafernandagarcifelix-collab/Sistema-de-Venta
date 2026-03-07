// frontend/js/dashboard.js

// Lógica para cambiar de pantallas (SPA)
function cambiarModulo(moduloActivo, idBoton) {
    document.getElementById('modulo-inicio').classList.add('hidden');
    document.getElementById('modulo-ventas').classList.add('hidden');
    document.getElementById('modulo-inventario').classList.add('hidden');
    document.getElementById('modulo-reportes').classList.add('hidden'); 
    document.getElementById('modulo-nomina').classList.add('hidden');

    document.querySelectorAll('.sidebar a').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(moduloActivo).classList.remove('hidden');
    
    if(idBoton) {
        document.getElementById(idBoton).classList.add('active');
    }
}

// Configuración inicial de usuario (SSO NTLM) y Carga de Panel General
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const usuario = await fetchAPI('/auth/mi-sesion');
        document.getElementById('user-info').innerHTML = `<i class="fa-solid fa-user-check"></i> ${usuario.nombre} <br><small>${usuario.rol}</small>`;

        if (usuario.rol !== 'Administrador') {
            document.getElementById('menu-nomina').classList.add('hidden');
            // Si quieres ocultar el menú de reportes al cajero, descomenta esta línea:
            // document.getElementById('menu-reportes').classList.add('hidden');
        }

        // ====================================================
        // NUEVO: CARGAR LOS DATOS DINÁMICOS DEL INICIO
        // ====================================================
        const resumen = await fetchAPI('/reportes/resumen');
        
        // Seleccionamos las etiquetas <h2> dentro del módulo de inicio (en el mismo orden en que las pusimos)
        const tarjetas = document.querySelectorAll('#modulo-inicio .dashboard-card h2');
        
        // Les inyectamos los datos reales
        tarjetas[0].textContent = `$${resumen.ventasHoy.toFixed(2)}`; // Ventas Hoy
        tarjetas[1].textContent = resumen.productosActivos;           // Productos
        tarjetas[2].textContent = resumen.personal;                   // Personal
        tarjetas[3].textContent = resumen.stockBajo;                  // Stock Bajo
        // ====================================================

        cambiarModulo('modulo-inicio', 'menu-inicio');

    } catch (error) {
        
        document.getElementById('user-info').innerHTML = `<i class="fa-solid fa-user-xmark" style="color:#ef4444;"></i> <br><small style="color:#ef4444;">${error.message}</small>`;
        cambiarModulo('modulo-inicio', 'menu-inicio');
    }
});

// Event Listeners de los botones del menú
document.getElementById('menu-inicio').addEventListener('click', () => cambiarModulo('modulo-inicio', 'menu-inicio'));
document.getElementById('menu-ventas').addEventListener('click', () => cambiarModulo('modulo-ventas', 'menu-ventas'));
document.getElementById('menu-inventario').addEventListener('click', () => { 
    cambiarModulo('modulo-inventario', 'menu-inventario'); 
    cargarInventario(); 
});
document.getElementById('menu-reportes').addEventListener('click', () => { 
    cambiarModulo('modulo-reportes', 'menu-reportes'); 
    cargarReportes(); 
});

document.getElementById('menu-nomina').addEventListener('click', () => {
    cambiarModulo('modulo-nomina', 'menu-nomina');
    cargarDatosRH(); // <--- ESTA ES LA LÍNEA MÁGICA QUE MANDA A TRAER LOS DATOS DE MONGODB
});