let productosLocales = [];
const modalProd = new bootstrap.Modal(document.getElementById('modalProducto'));
const modalAbast = new bootstrap.Modal(document.getElementById('modalAbastecer'));

async function cargarInventario() {
    productosLocales = await fetchAPI('/productos');
    const tbody = document.getElementById('inventario-body');
    const selectAbastecer = document.getElementById('abastecer-prod');
    
    tbody.innerHTML = '';
    selectAbastecer.innerHTML = '<option value="">Selecciona...</option>';

    productosLocales.forEach(prod => {
        // Llenar tabla
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="/public/img/productos/${prod.imagen}" onerror="this.src='/public/img/productos/default.jpg'"></td>
            <td class="fw-bold">${prod.nombre}</td>
            <td><span class="badge bg-secondary">${prod.categoria}</span></td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td class="${prod.stock <= 5 ? 'text-danger fw-bold' : ''}">${prod.stock}</td>
            <td>
                <button class="btn btn-primary btn-sm me-1" onclick='abrirModalProducto(${JSON.stringify(prod)})'><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="eliminarProducto('${prod._id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);

        // Llenar select de abastecer
        selectAbastecer.innerHTML += `<option value="${prod._id}">${prod.nombre} (Stock: ${prod.stock})</option>`;
    });
}

function abrirModalProducto(prod = null) {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = prod ? prod._id : '';
    document.getElementById('modalProductoTitle').innerText = prod ? 'Editar Producto' : 'Agregar Producto';
    
    if(prod) {
        document.getElementById('prod-nombre').value = prod.nombre;
        document.getElementById('prod-precio').value = prod.precio;
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-categoria').value = prod.categoria;
    }
    modalProd.show();
}

document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const body = {
        nombre: document.getElementById('prod-nombre').value,
        precio: document.getElementById('prod-precio').value,
        stock: document.getElementById('prod-stock').value,
        categoria: document.getElementById('prod-categoria').value
    };

    try {
        if(id) await fetchAPI(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        else await fetchAPI('/productos', { method: 'POST', body: JSON.stringify(body) });
        
        modalProd.hide();
        UI.toast('success', id ? 'Producto actualizado' : 'Producto agregado');
        cargarInventario();
    } catch (e) { UI.toast('error', e.message); }
});

document.getElementById('form-abastecer').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('abastecer-prod').value;
    const cant = document.getElementById('abastecer-cant').value;
    try {
        await fetchAPI(`/productos/${id}/abastecer`, { method: 'PATCH', body: JSON.stringify({ cantidad: cant }) });
        modalAbast.hide();
        UI.toast('success', 'Stock abastecido');
        cargarInventario();
    } catch (e) { UI.toast('error', e.message); }
});

async function eliminarProducto(id) {
    const confirm = await UI.confirm('¿Eliminar producto?', 'Esta acción no se puede deshacer.');
    if(confirm.isConfirmed) {
        try {
            await fetchAPI(`/productos/${id}`, { method: 'DELETE' });
            UI.toast('success', 'Eliminado correctamente');
            cargarInventario();
        } catch (e) { UI.toast('error', e.message); }
    }
}