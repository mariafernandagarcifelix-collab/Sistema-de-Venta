// frontend/js/api.js

// ¡OJO AQUÍ, FER! 
// Para probar en tu compu, déjalo como 'http://localhost:3000'
// Cuando vayas a presentarlo en la red local, cámbialo por la IP de tu Windows Server, ej: 'http://192.168.1.10:3000'
// frontend/js/api.js
const BASE_URL = 'http://localhost:3000/api';

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