const ntlm = require('express-ntlm');
const Usuario = require('../models/Usuario');

// 1. Middleware que le pide al navegador las credenciales de Windows
const autenticacionWindows = ntlm({
    debug: function() {
        // Puedes poner console.log aquí si quieres ver la negociación interna
    },
    // domain: 'TUDOMINIO' // Opcional: Si tienes un dominio estricto configurado en el server
});

// 2. Middleware que verifica el rol en MongoDB basado en el usuario de Windows
const verificarUsuarioLocal = async (req, res, next) => {
    // NTLM nos entrega el nombre de usuario de la sesión de Windows en req.ntlm.UserName
    if (!req.ntlm || !req.ntlm.UserName) {
        return res.status(401).json({ error: 'No se detectó una sesión activa de Windows.' });
    }

    const usernameWindows = req.ntlm.UserName.toLowerCase(); // Ej: 'fernanda' o 'cajero1'

    try {
        // Buscamos si ese usuario de Windows tiene permisos en nuestro sistema
        const usuarioDB = await Usuario.findOne({ username: usernameWindows });

        if (!usuarioDB) {
            return res.status(403).json({ error: `El usuario de Windows '${usernameWindows}' no está registrado en el POS.` });
        }

        // Si existe, lo guardamos en la request para que los controladores lo usen
        req.usuario = {
            id: usuarioDB._id,
            nombre: usuarioDB.nombre,
            username: usernameWindows,
            rol: usuarioDB.rol
        };
        
        next();
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar el usuario de Windows.' });
    }
};

// 3. El mismo verificador de roles que ya teníamos
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. Tu rol de Windows no tiene permisos para esto.' });
        }
        next();
    };
};

module.exports = { autenticacionWindows, verificarUsuarioLocal, verificarRol };