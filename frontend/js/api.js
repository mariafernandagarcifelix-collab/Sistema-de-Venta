// frontend/js/api.js
//const BASE_URL = 'http://www.cuadras.com:3000/api';
const BASE_URL = 'http://localhost:3000/api';
// const BASE_URL = 'http://192.168.1.50:3000/api';

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers },
            credentials: 'include' // VITAL para mandar la sesión de Windows
        });

        // Verificamos si el servidor contestó con JSON para evitar errores de sintaxis
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            // Si hay error, simplemente lo lanzamos, ya no recargamos la página
            throw new Error((data && data.error) || `Error de acceso (${response.status})`);
        }

        return data;
    } catch (error) {
        console.error('[Error API]:', error.message);
        throw error;
    }
}

// ========================================================
// HELPERS GLOBALES: Alertas bonitas y diseño Glassmorphism
// ========================================================
const UI = {
    toast: (icon, title) => {
        Swal.fire({ 
            toast: true, 
            position: 'top-end', 
            icon, 
            title, 
            showConfirmButton: false, 
            timer: 3000, 
            background: document.body.classList.contains('dark') ? '#1e293b' : '#ffffff', 
            color: document.body.classList.contains('dark') ? '#ffffff' : '#000000' 
        });
    },
    confirm: async (title, text) => {
        return await Swal.fire({ 
            title, 
            text, 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#10b981', // Color verde
            cancelButtonColor: '#ef4444',  // Color rojo
            confirmButtonText: 'Sí, continuar', 
            cancelButtonText: 'Cancelar', 
            background: document.body.classList.contains('dark') ? '#1e293b' : '#ffffff', 
            color: document.body.classList.contains('dark') ? '#ffffff' : '#000000' 
        });
    }
};