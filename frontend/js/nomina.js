// frontend/js/nomina.js

// Función principal para cargar todo al entrar al módulo
async function cargarDatosRH() {
    await cargarEmpleados();
    await cargarHistorialPagos();
}

async function cargarEmpleados() {
    try {
        const empleados = await fetchAPI('/empleados');
        
        const tbody = document.getElementById('empleados-body');
        const selectPago = document.getElementById('pago-empleado');
        
        tbody.innerHTML = '';
        selectPago.innerHTML = '<option value="">Selecciona un empleado...</option>';

        empleados.forEach(emp => {
            // Llenar tabla de empleados
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.nombre}</td>
                <td>${emp.puesto}</td>
                <td>$${emp.salario.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);

            // Llenar el select para poder pagarles
            const option = document.createElement('option');
            option.value = emp._id;
            option.textContent = `${emp.nombre} - $${emp.salario}`;
            selectPago.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar empleados:', error);
    }
}

async function cargarHistorialPagos() {
    try {
        const historial = await fetchAPI('/nomina/historial');
        const tbody = document.getElementById('pagos-body');
        tbody.innerHTML = '';

        historial.forEach(pago => {
            // Formatear la fecha para que sea legible
            const fecha = new Date(pago.fecha_pago).toLocaleDateString();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fecha}</td>
                <td>${pago.empleado ? pago.empleado.nombre : 'Desconocido'}</td>
                <td class="fw-bold text-white">$${pago.monto.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

// Guardar un nuevo empleado
document.getElementById('form-empleado').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoEmpleado = {
        nombre: document.getElementById('emp-nombre').value,
        puesto: document.getElementById('emp-puesto').value,
        salario: parseFloat(document.getElementById('emp-salario').value)
    };

    try {
        await fetchAPI('/empleados', {
            method: 'POST',
            body: JSON.stringify(nuevoEmpleado)
        });
        
        alert('Empleado registrado exitosamente.');
        document.getElementById('form-empleado').reset();
        cargarEmpleados(); // Recargar la lista
    } catch (error) {
        alert('Error al guardar empleado: ' + error.message);
    }
});

// Registrar el pago a un empleado
document.getElementById('form-pago').addEventListener('submit', async (e) => {
    e.preventDefault();

    const empleado_id = document.getElementById('pago-empleado').value;
    const montoInput = document.getElementById('pago-monto').value;
    
    // Si el input de monto tiene algo, lo usamos, si no, lo mandamos indefinido 
    // para que el backend use el salario base por defecto.
    const datosPago = {
        empleado_id: empleado_id,
        monto: montoInput ? parseFloat(montoInput) : undefined
    };

    try {
        await fetchAPI('/nomina/pagar', {
            method: 'POST',
            body: JSON.stringify(datosPago)
        });
        
        alert('Pago registrado correctamente.');
        document.getElementById('form-pago').reset();
        cargarHistorialPagos(); // Recargar la tabla de historial
    } catch (error) {
        alert('Error al registrar pago: ' + error.message);
    }
});