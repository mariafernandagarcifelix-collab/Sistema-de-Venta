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

// Configuración inicial de usuario (SSO NTLM)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const usuario = await fetchAPI('/auth/mi-sesion');
        document.getElementById('user-info').innerHTML = `<i class="fa-solid fa-user-check"></i> ${usuario.nombre} <br><small>${usuario.rol}</small>`;

        // Si es Cajero, bloquear la nómina por completo
        if (usuario.rol !== 'Administrador') {
            document.getElementById('menu-nomina').classList.add('hidden');
        }

        // Cargamos la pantalla de inicio al entrar
        cambiarModulo('modulo-inicio', 'menu-inicio');

    } catch (error) {
        // Si hay error (ej. el usuario de Windows no está en la BD), detenemos el "Cargando..." y lo mostramos en rojo
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