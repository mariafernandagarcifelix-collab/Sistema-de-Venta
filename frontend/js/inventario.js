// frontend/js/inventario.js

async function cargarInventario() {
    try {
        const productos = await fetchAPI('/productos');
        const tbody = document.getElementById('inventario-body');
        tbody.innerHTML = '';

        productos.forEach(prod => {
            // Verificamos si hay poco stock para pintarlo de rojo
            const stockStyle = prod.stock <= 5 ? 'color: red; font-weight: bold;' : '';
            
            // Construimos la URL de la imagen usando nuestra BASE_URL de la API (quitando el /api)
            const serverUrl = BASE_URL.replace('/api', '');
            const imgUrl = `${serverUrl}/public/img/productos/${prod.imagen}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imgUrl}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>$${prod.precio.toFixed(2)}</td>
                <td style="${stockStyle}">${prod.stock}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="eliminarProducto('${prod._id}')">🗑️ Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error al cargar inventario: ' + error.message);
    }
}

document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById('prod-nombre').value,
        precio: parseFloat(document.getElementById('prod-precio').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        categoria: document.getElementById('prod-categoria').value,
        imagen: document.getElementById('prod-imagen').value
    };

    try {
        await fetchAPI('/productos', {
            method: 'POST',
            body: JSON.stringify(nuevoProducto)
        });
        
        alert('Producto agregado al inventario.');
        document.getElementById('form-producto').reset();
        document.getElementById('prod-imagen').value = 'default.jpg';
        cargarInventario(); // Recargamos la tabla
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
});

async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar (desactivar) este producto?')) {
        try {
            await fetchAPI(`/productos/${id}`, { method: 'DELETE' });
            cargarInventario(); // Recargar la tabla
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
}