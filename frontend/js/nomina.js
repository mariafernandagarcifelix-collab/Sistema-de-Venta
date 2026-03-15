let listaEmpleados = [];
const modalEmp = new bootstrap.Modal(document.getElementById('modalEmpleado'));

// LÓGICA DE CÁLCULO AUTOMÁTICO
function calcularPagoAutomatico() {
    const idEmp = document.getElementById('pago-empleado').value;
    const dias = document.getElementById('pago-dias').value || 0;
    const empleado = listaEmpleados.find(e => e._id === idEmp);
    
    if (empleado) {
        const sueldo = empleado.sueldo_base || empleado.salario || 0;
        const total = sueldo * dias;
        document.getElementById('pago-total').value = total.toFixed(2);
    } else {
        document.getElementById('pago-total').value = '0.00';
    }
}

document.getElementById('pago-empleado').addEventListener('change', calcularPagoAutomatico);
document.getElementById('pago-dias').addEventListener('input', calcularPagoAutomatico);

// CARGAR EMPLEADOS
async function cargarDatosRH() {
    try {
        listaEmpleados = await fetchAPI('/empleados');
        const tbody = document.getElementById('empleados-body');
        const selectPago = document.getElementById('pago-empleado');
        const selectFiltro = document.getElementById('filtro-empleado-nomina'); 
        
        tbody.innerHTML = '';
        selectPago.innerHTML = '<option value="">Selecciona...</option>';
        selectFiltro.innerHTML = '<option value="">Todos los empleados...</option>';

        listaEmpleados.forEach(emp => {
            const sueldo = emp.sueldo_base || emp.salario || 0;

            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold">${emp.nombre}</td>
                    <td><span class="badge bg-primary">${emp.puesto}</span></td>
                    <td class="fw-bold">$${sueldo.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1 shadow-sm" onclick='abrirModalEmpleado(${JSON.stringify(emp)})'><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger btn-sm shadow-sm" onclick="eliminarEmpleado('${emp._id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
            
            selectPago.innerHTML += `<option value="${emp._id}">${emp.nombre}</option>`;
            selectFiltro.innerHTML += `<option value="${emp._id}">${emp.nombre}</option>`;
        });

        // Cargamos la tabla de historial inicial
        buscarHistorialNomina();

    } catch (e) { console.error(e); }
}

// ==========================================
// FILTROS E HISTORIAL DE NÓMINA (LA SOLUCIÓN AL BOTÓN)
// ==========================================

document.getElementById('form-filtros-nomina').addEventListener('submit', (e) => {
    e.preventDefault();
    buscarHistorialNomina(); // Esto hace que la lupa funcione
});

function limpiarFiltrosNomina() {
    document.getElementById('form-filtros-nomina').reset();
    buscarHistorialNomina(); // Esto hace que la goma de borrar funcione
}

async function buscarHistorialNomina() {
    const fInicio = document.getElementById('filtro-inicio-nomina').value;
    const fFin = document.getElementById('filtro-fin-nomina').value;
    const emp = document.getElementById('filtro-empleado-nomina').value;

    let query = '?';
    if(fInicio) query += `fechaInicio=${fInicio}&`;
    if(fFin) query += `fechaFin=${fFin}&`;
    if(emp) query += `empleadoId=${emp}`;

    try {
        const historial = await fetchAPI(`/nomina${query}`);
        const tbody = document.getElementById('historial-nomina-body');
        tbody.innerHTML = '';

        if(historial.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No se encontraron registros de pago con esos filtros.</td></tr>';
            return;
        }

        historial.forEach(pago => {
            const date = new Date(pago.fecha_pago).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
            
            tbody.innerHTML += `
                <tr>
                    <td><span class="badge bg-secondary">${date}</span></td>
                    <td class="fw-bold"><i class="fa-solid fa-user text-info"></i> ${pago.empleado ? pago.empleado.nombre : 'Empleado Borrado'}</td>
                    <td>${pago.dias_trabajados || 1} días</td>
                    <td class="fw-bold text-success">$${pago.monto.toFixed(2)}</td>
                </tr>
            `;
        });
    } catch (e) { 
        UI.toast('error', 'Error al cargar el historial de nómina'); 
    }
}

// ==========================================
// OPERACIONES CRUD DE EMPLEADOS Y PAGOS
// ==========================================

function abrirModalEmpleado(emp = null) {
    document.getElementById('form-empleado-modal').reset();
    document.getElementById('emp-id').value = emp ? emp._id : '';
    document.getElementById('modalEmpleadoTitle').innerText = emp ? 'Editar Empleado' : 'Nuevo Empleado';
    
    if(emp) {
        document.getElementById('emp-nombre').value = emp.nombre;
        document.getElementById('emp-puesto').value = emp.puesto;
        document.getElementById('emp-salario').value = emp.sueldo_base || emp.salario || 0;
    }
    modalEmp.show();
}

document.getElementById('form-empleado-modal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('emp-id').value;
    const body = {
        nombre: document.getElementById('emp-nombre').value,
        puesto: document.getElementById('emp-puesto').value,
        sueldo_base: document.getElementById('emp-salario').value 
    };
    
    try {
        if(id) await fetchAPI(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        else await fetchAPI('/empleados', { method: 'POST', body: JSON.stringify(body) });
        
        modalEmp.hide();
        UI.toast('success', id ? 'Empleado actualizado' : 'Empleado registrado');
        cargarDatosRH();
    } catch (e) { UI.toast('error', e.message); }
});

async function eliminarEmpleado(id) {
    const confirm = await UI.confirm('¿Despedir empleado?', 'Esta acción lo eliminará del sistema.');
    if(confirm.isConfirmed) {
        try {
            await fetchAPI(`/empleados/${id}`, { method: 'DELETE' });
            UI.toast('success', 'Empleado eliminado');
            cargarDatosRH();
        } catch (e) { UI.toast('error', e.message); }
    }
}

// REGISTRAR PAGO
document.getElementById('form-pago').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        empleado: document.getElementById('pago-empleado').value,
        dias_trabajados: document.getElementById('pago-dias').value,
        monto: parseFloat(document.getElementById('pago-total').value)
    };
    
    try {
        await fetchAPI('/nomina', { method: 'POST', body: JSON.stringify(body) });
        UI.toast('success', 'Nómina pagada exitosamente');
        
        document.getElementById('form-pago').reset();
        document.getElementById('pago-total').value = '0.00';
        
        // Actualizamos la tabla de historial al instante
        buscarHistorialNomina();
        
    } catch (e) { UI.toast('error', e.message); }
});

// ==========================================
// MEJORAS DE UX (Experiencia de Usuario)
// ==========================================
const inputDias = document.getElementById('pago-dias');

// Cuando el usuario hace clic adentro de la cajita, quitamos el 1 automáticamente
inputDias.addEventListener('focus', function() {
    if (this.value === '1') {
        this.value = '';
    }
});

// Si el usuario da clic afuera sin haber escrito nada, le regresamos el 1 por seguridad
inputDias.addEventListener('blur', function() {
    if (this.value === '' || parseInt(this.value) <= 0) {
        this.value = '1';
        calcularPagoAutomatico(); // Forzamos el recálculo para que el total no se quede en cero
    }
});