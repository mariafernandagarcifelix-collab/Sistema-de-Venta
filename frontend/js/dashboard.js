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
        // 1. Le pedimos al backend que lea el gafete de Windows del usuario actual
        const respuesta = await fetchAPI('/auth/me');
        const usuario = respuesta.usuario;

        // 2. Mostramos su nombre y su puesto en la esquina del menú lateral
        document.getElementById('user-info').innerHTML = `
            <i class="fa-solid fa-circle-user"></i> ${usuario.nombre.split('\\').pop()} <br>
            <small class="text-warning fw-bold">${usuario.rol}</small>
        `;

        // 3. LA MAGIA VISUAL: Si es un Cajero, le escondemos los módulos confidenciales
        if (usuario.rol === 'Cajero') {
            document.getElementById('menu-inventario').style.display = 'none';
            document.getElementById('menu-nomina').style.display = 'none';
            document.getElementById('menu-reportes').style.display = 'none'; 
            
            // Opcional: Forzamos a que inicie directamente en la pestaña de Ventas
            document.getElementById('menu-ventas').click(); 
        } else {
            // Si es Administrador, inicia en el Dashboard general
            document.getElementById('menu-inicio').click();
        }

    } catch (error) {
        // Si no es ni Admin ni Cajero, le mostramos un error y ocultamos todo
        document.getElementById('user-info').innerHTML = `
            <i class="fa-solid fa-triangle-exclamation text-danger"></i> Acceso Denegado
        `;
        UI.toast('error', 'Tu usuario de red no tiene permisos para este sistema.');
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