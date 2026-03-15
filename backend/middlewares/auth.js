const { sso } = require('node-expose-sspi');

// 1. El Escáner de Gafetes
const ssoMiddleware = sso.auth();

// 2. El Cadenero de los Módulos
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.sso || !req.sso.user) {
            return res.status(401).json({ error: 'No autorizado. Gafete de Windows no detectado.' });
        }

        const gruposAD = req.sso.user.groups || [];
        
        // Buscamos específicamente a qué grupo pertenecen
        const esAdmin = gruposAD.some(grupo => grupo.toLowerCase().includes('admin'));
        const esCajero = gruposAD.some(grupo => grupo.toLowerCase().includes('cajero'));
        
        let rolUsuario = null;

        // Asignamos el rol estricto
        if (esAdmin) {
            rolUsuario = 'Administrador';
        } else if (esCajero) {
            rolUsuario = 'Cajero';
        } else {
            // Si entra alguien de otro departamento, lo bloqueamos por completo
            return res.status(403).json({ error: 'Acceso denegado. Tu usuario no pertenece al grupo de Cajeros ni Administradores del sistema.' });
        }

        // Verificamos si ese rol tiene permiso para la ruta que está pidiendo
        if (!rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).json({ error: 'Acceso denegado. Esta bóveda es solo para ' + rolesPermitidos.join(' o ') });
        }
        
        req.usuario = { nombre: req.sso.user.name, rol: rolUsuario };
        next();
    };
};

module.exports = { ssoMiddleware, verificarRol };