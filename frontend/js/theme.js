// frontend/js/theme.js

function toggleDark() {
    document.body.classList.toggle("dark");
    // Guardamos la preferencia del usuario en el navegador local
    localStorage.setItem("tema_oscuro", document.body.classList.contains("dark"));
}

// Al cargar la pantalla, leemos si el usuario lo dejó activado
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("tema_oscuro") === "true") {
        document.body.classList.add("dark");
    }
});