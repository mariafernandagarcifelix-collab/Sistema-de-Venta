// frontend/js/ventas.js

let carrito = [];
let productosDisponibles = []; // Guardamos los productos en memoria para buscar sus precios rápido

// 1. Cargar los productos desde el backend al abrir la pantalla
async function cargarProductosParaVenta() {
    try {
        const select = document.getElementById('producto-select');
        select.innerHTML = '<option value="">Cargando...</option>';

        // Obtenemos los productos activos desde el backend
        productosDisponibles = await fetchAPI('/productos');
        
        // Limpiamos y llenamos el select
        select.innerHTML = '<option value="">Selecciona un producto</option>';
        
        productosDisponibles.forEach(prod => {
            // Solo mostramos productos que tengan stock
            if (prod.stock > 0) {
                const option = document.createElement('option');
                option.value = prod._id;
                option.textContent = `${prod.nombre} - $${prod.precio} (Stock: ${prod.stock})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        alert('Error al cargar productos: ' + error.message);
    }
}

// 2. Agregar un producto al carrito
function agregarAlCarrito() {
    const select = document.getElementById('producto-select');
    const cantidadInput = document.getElementById('cantidad-input');
    
    const productoId = select.value;
    const cantidad = parseInt(cantidadInput.value);

    if (!productoId || cantidad <= 0) {
        alert('Por favor selecciona un producto y una cantidad válida.');
        return;
    }

    // Buscamos los datos completos del producto en nuestra lista en memoria
    const productoInfo = productosDisponibles.find(p => p._id === productoId);

    // Validamos el stock localmente antes de agregarlo al carrito
    if (cantidad > productoInfo.stock) {
        alert(`Solo hay ${productoInfo.stock} unidades de ${productoInfo.nombre} disponibles.`);
        return;
    }

    // Verificamos si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.productoId === productoId);

    if (itemExistente) {
        // Validamos que la nueva suma no exceda el stock
        if (itemExistente.cantidad + cantidad > productoInfo.stock) {
            alert('No puedes agregar más de la cantidad en stock.');
            return;
        }
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = itemExistente.cantidad * productoInfo.precio;
    } else {
        // Si no existe, lo agregamos como nuevo
        carrito.push({
            productoId: productoInfo._id,
            nombre: productoInfo.nombre,
            precio: productoInfo.precio,
            cantidad: cantidad,
            subtotal: cantidad * productoInfo.precio
        });
    }

    // Limpiamos los inputs y actualizamos la tabla
    select.value = '';
    cantidadInput.value = '1';
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
            <td>${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>${item.cantidad}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${index})">✖️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalSpan.textContent = total.toFixed(2);
}

// 4. Quitar un producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
}

// 5. Enviar la venta al backend
async function procesarVenta() {
    if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    try {
        // Formateamos los datos como el backend los espera: [{ producto: "ID", cantidad: 2 }]
        const productosParaBackend = carrito.map(item => ({
            producto: item.productoId,
            cantidad: item.cantidad
        }));

        // Hacemos la petición POST a nuestra API
        const respuesta = await fetchAPI('/ventas', {
            method: 'POST',
            body: JSON.stringify({ productos: productosParaBackend })
        });

        alert('¡Venta registrada con éxito!');
        
        // Limpiamos el carrito, actualizamos la tabla y recargamos los productos 
        // para que el select muestre el nuevo stock actualizado desde la BD.
        carrito = [];
        renderizarCarrito();
        await cargarProductosParaVenta();

    } catch (error) {
        alert('Error al procesar la venta: ' + error.message);
    }
}

// Inicializar cargando los productos
cargarProductosParaVenta();