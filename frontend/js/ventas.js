// frontend/js/ventas.js

let carrito = [];
let productosDisponibles = []; 

// 1. Cargar los productos desde el backend al abrir la pantalla
async function cargarProductosParaVenta() {
    try {
        const select = document.getElementById('producto-select');
        select.innerHTML = '<option value="">Cargando...</option>';

        productosDisponibles = await fetchAPI('/productos');
        
        select.innerHTML = '<option value="">Selecciona un producto</option>';
        
        productosDisponibles.forEach(prod => {
            if (prod.stock > 0) {
                const option = document.createElement('option');
                option.value = prod._id;
                option.textContent = `${prod.nombre} - $${prod.precio} (Stock: ${prod.stock})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        UI.toast('error', 'Error al cargar el inventario');
    }
}

// 2. Agregar un producto al carrito
function agregarAlCarrito() {
    const select = document.getElementById('producto-select');
    const cantidadInput = document.getElementById('cantidad-input');
    
    const productoId = select.value;
    // Si la caja está vacía, forzamos a que sea 0 para que lance la alerta de cantidad inválida
    const cantidad = parseInt(cantidadInput.value) || 0; 

    if (!productoId || cantidad <= 0) {
        UI.toast('warning', 'Selecciona un producto y una cantidad válida');
        return;
    }

    const productoInfo = productosDisponibles.find(p => p._id === productoId);

    // Validamos el stock localmente
    if (cantidad > productoInfo.stock) {
        UI.toast('error', `Solo hay ${productoInfo.stock} unidades de ${productoInfo.nombre}`);
        cantidadInput.value = ''; // <-- Vaciamos la caja por falta de stock
        return;
    }

    const itemExistente = carrito.find(item => item.productoId === productoId);

    if (itemExistente) {
        // Validamos que la nueva suma no exceda el stock
        if (itemExistente.cantidad + cantidad > productoInfo.stock) {
            UI.toast('error', 'No puedes agregar más del stock disponible');
            cantidadInput.value = ''; // <-- Vaciamos la caja por falta de stock
            return;
        }
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = itemExistente.cantidad * productoInfo.precio;
    } else {
        carrito.push({
            productoId: productoInfo._id,
            nombre: productoInfo.nombre,
            precio: productoInfo.precio,
            cantidad: cantidad,
            subtotal: cantidad * productoInfo.precio
        });
    }

    // Limpiamos los inputs y regresamos el 1 por defecto para el siguiente producto
    select.value = '';
    cantidadInput.value = '1';
    UI.toast('success', 'Agregado a la caja');
    renderizarCarrito();
}

// 3. Dibujar la tabla del carrito y calcular el total
function renderizarCarrito() {
    const tbody = document.getElementById('carrito-body');
    const totalSpan = document.getElementById('total-venta');
    
    tbody.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.subtotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td><span class="badge bg-secondary">${item.cantidad}</span></td>
            <td class="text-success fw-bold">$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-outline-danger btn-sm shadow-sm" onclick="eliminarDelCarrito(${index})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalSpan.textContent = total.toFixed(2);
}

// 4. Quitar un producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    UI.toast('info', 'Producto retirado');
    renderizarCarrito();
}

// 5. Enviar la venta al backend
async function procesarVenta() {
    if (carrito.length === 0) {
        UI.toast('warning', 'La caja registradora está vacía');
        return;
    }

    const confirmar = await UI.confirm('¿Cobrar venta?', `Se registrará un pago por $${document.getElementById('total-venta').textContent}`);
    
    if (!confirmar.isConfirmed) {
        return; 
    }

    try {
        const productosParaBackend = carrito.map(item => ({
            producto: item.productoId,
            cantidad: item.cantidad
        }));

        await fetchAPI('/ventas', {
            method: 'POST',
            body: JSON.stringify({ productos: productosParaBackend })
        });

        UI.toast('success', '¡Venta cobrada con éxito!');
        
        carrito = [];
        renderizarCarrito();
        await cargarProductosParaVenta();

    } catch (error) {
        UI.toast('error', error.message || 'Error al procesar la venta');
    }
}

// ==========================================
// MEJORAS DE UX (Experiencia de Usuario)
// ==========================================
const inputCantidad = document.getElementById('cantidad-input');

// Cuando el usuario hace clic adentro de la cajita, quitamos el 1 automáticamente
inputCantidad.addEventListener('focus', function() {
    if (this.value === '1') {
        this.value = '';
    }
});

// Si el usuario da clic afuera sin haber escrito nada, le regresamos el 1 por seguridad
inputCantidad.addEventListener('blur', function() {
    if (this.value === '' || parseInt(this.value) <= 0) {
        this.value = '1';
    }
});

// Inicializar cargando los productos
cargarProductosParaVenta();