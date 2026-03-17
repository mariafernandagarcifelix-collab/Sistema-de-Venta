const { sso } = require('node-expose-sspi');

// 1. El Escáner de Gafetes (Leemos el Ticket de Windows del Navegador)
const ssoMiddleware = [
    sso.auth(),
    (req, res, next) => {
        // --- 📊 LOGGING TOTAL (MODO DIAGNÓSTICO PROFUNDO) ---
        // Se ejecuta después de intentar leer las credenciales SSPI
        
        const timestamp = new Date().toISOString();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || 'Desconocido';
        
        console.log(`\n[AUTH DEBUG] Timestamp: ${timestamp}`);
        console.log(`[AUTH DEBUG] Ruta solicitada: ${req.method} ${req.originalUrl}`);
        console.log(`[AUTH DEBUG] IP del cliente: ${ip}`);
        console.log(`[AUTH DEBUG] User-Agent: ${userAgent}`);

        if (req.sso && req.sso.user) {
            const authMethod = req.sso.method || 'Desconocido (NTLM/Kerberos)';
            const username = req.sso.user.name || 'Desconocido';
            const sid = req.sso.user.sid || 'No disponible';
            const rawGroups = req.sso.user.groups || [];
            
            console.log(`[AUTH DEBUG] Estado: ✅ Autenticado por Windows`);
            console.log(`[AUTH DEBUG] Método: ${authMethod}`);
            console.log(`[AUTH DEBUG] Usuario completo: ${username}`);
            console.log(`[AUTH DEBUG] SID: ${sid}`);
            
            console.log(`[AUTH DEBUG] Grupos crudos (Active Directory):`);
            if (rawGroups.length === 0) {
                console.log(`  ❌ ADVERTENCIA: El usuario no tiene grupos asignados.`);
            } else {
                rawGroups.forEach(g => {
                    const groupName = typeof g === 'string' ? g : (g.name || JSON.stringify(g));
                    console.log(`  - ${groupName}`);
                });
            }
        } else {
            console.log(`[AUTH DEBUG] Estado: ❌ NO autenticado.`);
            console.log(`[AUTH DEBUG] Causa probable:`);
            console.log(`  1. El navegador no envió el ticket Kerberos/NTLM automáticamente.`);
            console.log(`  2. El servidor NodeJS no está unido al dominio.`);
            console.log(`  3. Falta configurar Intranet Local en Opciones de Internet del cliente.`);
            console.log(`  4. CORS mal configurado (withCredentials no está viajando).`);
        }
        console.log(`---------------------------------------------------\n`);
        next();
    }
];

// Helper robusto para analizar grupos (maneja si vienen como objeto o string)
const checkGroupList = (groups, keyword) => {
    return groups.some(g => {
        const groupName = typeof g === 'string' ? g : (g.name || '');
        return groupName.toLowerCase().includes(keyword.toLowerCase());
    });
};

// 2. El Cadenero de los Módulos
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.sso || !req.sso.user) {
            console.error('❌ [SSPI ERROR] Gafete de Windows no detectado. Revisa credenciales o Trusted Sites.');
            return res.status(401).json({ 
                error: 'No autorizado. Autenticación de Windows SSPI fallida.',
                diagnostico: 'El navegador bloqueó el ticket o el dominio no es accesible.'
            });
        }

        const gruposAD = req.sso.user.groups || [];
        
        if (gruposAD.length === 0) {
            console.error(`❌ [SSPI ERROR] Usuario ${req.sso.user.name} detectado, pero SIN grupos asignados en Active Directory.`);
            return res.status(401).json({ error: 'No autorizado. Tu usuario Windows no tiene grupos de seguridad.' });
        }

        // Buscamos de forma robusta e insensible a mayúsculas
        const esAdmin = checkGroupList(gruposAD, 'admin') || checkGroupList(gruposAD, 'sg_admin') || checkGroupList(gruposAD, 'domain admin');
        const esCajero = checkGroupList(gruposAD, 'cajero') || checkGroupList(gruposAD, 'sg_cajero');
        
        let rolUsuario = null;

        if (esAdmin) {
            rolUsuario = 'Administrador';
        } else if (esCajero) {
            rolUsuario = 'Cajero';
        } else {
            console.warn(`⚠️ [AUTH] Usuario ${req.sso.user.name} rechazado. Grupos:`, gruposAD);
            return res.status(403).json({ error: 'Acceso denegado. No eres Cajero ni Admin.' });
        }

        if (!rolesPermitidos.includes(rolUsuario)) {
            console.warn(`⚠️ [AUTH] Usuario ${req.sso.user.name} (${rolUsuario}) intentó acceder a ruta para ${rolesPermitidos.join(', ')}`);
            return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
        }
        
        req.usuario = { nombre: req.sso.user.name, rol: rolUsuario };
        next();
    };
};

module.exports = { ssoMiddleware, verificarRol, checkGroupList };