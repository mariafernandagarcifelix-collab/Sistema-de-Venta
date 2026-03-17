const Empleado = require('../models/Empleado');
const { checkGroupList } = require('../middlewares/auth');

// Helper por si falló la importación y para mantener lógica robusta
const checkGroups = (groups, keyword) => {
    return groups.some(g => {
        const groupName = typeof g === 'string' ? g : (g.name || '');
        return groupName.toLowerCase().includes(keyword.toLowerCase());
    });
};

// Iniciar sesión leyendo el Gafete de Windows (SSO)
const loginSSO = async (req, res) => {
    try {
        // 1. Verificamos que el usuario de Windows esté presente
        if (!req.sso || !req.sso.user) {
            console.error('❌ [SSPI ERROR] `req.sso.user` no existe al intentar registrarse en MongoDB.');
            console.log('   Si usas Chrome/Edge, asegúrate de haber configurado Opciones de Internet > Intranet Local > Inicio de sesión automático');
            return res.status(401).json({ 
                error: 'No se detectó un usuario de red válido. SSPI no interceptó el ticket Kerberos/NTLM.',
                sugerencia: 'Revisa la configuración del navegador (Intranet Zone) y si el equipo está unido al dominio.'
            });
        }

        const nombreWindows = req.sso.user.name; // Ej. DOMINIO\Carlos
        const gruposAD = req.sso.user.groups || [];

        if (gruposAD.length === 0) {
            console.error(`❌ [SSPI ERROR] Usuario ${nombreWindows} detectado, pero la lista de grupos está VACÍA.`);
             return res.status(401).json({ 
                 error: `Usuario ${nombreWindows} sin grupos de administrador ni cajero.`,
                 sugerencia: 'Asegúrate que el servidor NodeJS puede leer los grupos desde el Active Directory y no existen restricciones de firewall.'
             });
        }

        // 2. Buscamos estrictamente a qué grupo pertenecen (Case Insensitive, Smart Matching)
        const esAdmin = checkGroups(gruposAD, 'admin') || checkGroups(gruposAD, 'sg_admin') || checkGroups(gruposAD, 'domain admin');
        const esCajero = checkGroups(gruposAD, 'cajero') || checkGroups(gruposAD, 'sg_cajero');

        let rolAsignado = null;

        if (esAdmin) {
            rolAsignado = 'Administrador';
        } else if (esCajero) {
            rolAsignado = 'Cajero';
        } else {
            console.warn(`⚠️ [AUTH] Intrusion denegada. Usuario ${nombreWindows} no es Administrador ni Cajero.`);
            // Si es un intruso de otro grupo, lo botamos antes de que toque la base de datos
            return res.status(403).json({ error: 'Tu usuario de red no pertenece a Administradores ni a Cajeros. Solicita acceso en AD.' });
        }

        console.log(`[AUTH DB] Asignando a ${nombreWindows} el rol de: ${rolAsignado}`);

        // 3. Sincronizamos con MongoDB
        // Buscamos si este usuario ya existe en nuestra base de datos
        let empleado = await Empleado.findOne({ nombre: nombreWindows });

        if (empleado) {
            // Si ya existe, le actualizamos el rol por si Carlos lo cambió de puesto en el Servidor
            if (empleado.puesto !== rolAsignado) {
                console.log(`[AUTH DB] Actualizando rol de empleado existente en la BD de ${empleado.puesto} a -> ${rolAsignado}`);
                empleado.puesto = rolAsignado;
                await empleado.save();
            }
        } else {
            // Si es su primer día de trabajo, lo registramos automáticamente en MongoDB
            console.log(`[AUTH DB] Creando *NUEVO* empleado en la BD: ${nombreWindows} como ${rolAsignado}`);
            empleado = new Empleado({
                nombre: nombreWindows,
                puesto: rolAsignado,
                sueldo_base: 0 // Luego Recursos Humanos le puede poner su sueldo real en el módulo de Nómina
            });
            await empleado.save();
        }

        // 4. Le damos la bienvenida al Frontend
        res.json({
            mensaje: 'Inicio de sesión automático exitoso',
            usuario: {
                id: empleado._id,
                nombre: empleado.nombre,
                rol: empleado.puesto
            }
        });

    } catch (error) {
        console.error('❌ [AUTH ERROR FATAL] Error en la sincronización del login:', error);
        res.status(500).json({ error: 'Error interno al validar las credenciales en la base de datos.', detalle: error.message });
    }
};

// Cerrar sesión (En Windows SSO esto suele ser limpiar la vista del frontend, pero dejamos la ruta por buenas prácticas)
const logout = (req, res) => {
    res.json({ mensaje: 'Sesión finalizada. Cierra tu navegador por seguridad.' });
};

module.exports = { loginSSO, logout };