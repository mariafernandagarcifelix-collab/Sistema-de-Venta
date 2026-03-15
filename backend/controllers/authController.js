const Empleado = require('../models/Empleado');

// Iniciar sesión leyendo el Gafete de Windows (SSO)
const loginSSO = async (req, res) => {
    try {
        // 1. Verificamos que el usuario de Windows esté presente
        if (!req.sso || !req.sso.user) {
            return res.status(401).json({ error: 'No se detectó un usuario de red válido.' });
        }

        const nombreWindows = req.sso.user.name; // Ej. DOMINIO\Carlos
        const gruposAD = req.sso.user.groups || [];

        // 2. Buscamos estrictamente a qué grupo pertenecen
        const esAdmin = gruposAD.some(grupo => grupo.toLowerCase().includes('admin'));
        const esCajero = gruposAD.some(grupo => grupo.toLowerCase().includes('cajero'));

        let rolAsignado = null;

        if (esAdmin) {
            rolAsignado = 'Administrador';
        } else if (esCajero) {
            rolAsignado = 'Cajero';
        } else {
            // Si es un intruso de otro grupo, lo botamos antes de que toque la base de datos
            return res.status(403).json({ error: 'Tu usuario de red no pertenece a Administradores ni a Cajeros.' });
        }

        // 3. Sincronizamos con MongoDB
        // Buscamos si este usuario ya existe en nuestra base de datos
        let empleado = await Empleado.findOne({ nombre: nombreWindows });

        if (empleado) {
            // Si ya existe, le actualizamos el rol por si Carlos lo cambió de puesto en el Servidor
            if (empleado.puesto !== rolAsignado) {
                empleado.puesto = rolAsignado;
                await empleado.save();
            }
        } else {
            // Si es su primer día de trabajo, lo registramos automáticamente en MongoDB
            empleado = new Empleado({
                nombre: nombreWindows,
                puesto: rolAsignado,
                sueldo_base: 0 // Luego Recursos Humanos le puede poner su sueldo real en el módulo de Nómina
            });
            await empleado.save();
        }

        // 4. Le damos la bienvenida al Frontend
        res.json({
            mensaje: 'Inicio de sesión autorizado',
            usuario: {
                id: empleado._id,
                nombre: empleado.nombre,
                rol: empleado.puesto
            }
        });

    } catch (error) {
        console.error('Error en la sincronización del login:', error);
        res.status(500).json({ error: 'Error interno al validar las credenciales en la base de datos.' });
    }
};

// Cerrar sesión (En Windows SSO esto suele ser limpiar la vista del frontend, pero dejamos la ruta por buenas prácticas)
const logout = (req, res) => {
    res.json({ mensaje: 'Sesión finalizada. Cierra tu navegador por seguridad.' });
};

module.exports = { loginSSO, logout };