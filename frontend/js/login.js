// frontend/js/login.js

// Si ya hay sesión activa, mandarlo directo al dashboard
if (localStorage.getItem('pos_token')) {
    window.location.href = 'views/dashboard.html';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que recargue la página
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        errorMsg.textContent = "Conectando al servidor...";
        
        // Usamos la función global que creamos en api.js
        const respuesta = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        // Manejo de Sesión: Guardamos token y datos en localStorage
        localStorage.setItem('pos_token', respuesta.token);
        localStorage.setItem('pos_usuario', JSON.stringify(respuesta.usuario));

        // Redirigimos al sistema
        window.location.href = 'views/dashboard.html';
        
    } catch (error) {
        errorMsg.textContent = error.message; // Mostramos el error del backend
    }
});