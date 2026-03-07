const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// Controlador para iniciar sesión
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscar al usuario
        const usuario = await Usuario.findOne({ username });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // 2. Verificar la contraseña usando el método del modelo
        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // 3. Generar el JWT
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token caduca en 8 horas (una jornada laboral)
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor durante el login.' });
    }
};

// Controlador auxiliar para crear el primer usuario administrador (para tus pruebas)
const registrarPrimerAdmin = async (req, res) => {
    try {
        const adminExiste = await Usuario.findOne({ rol: 'Administrador' });
        if (adminExiste) {
            return res.status(400).json({ error: 'Ya existe un administrador en el sistema.' });
        }

        const nuevoAdmin = new Usuario(req.body);
        await nuevoAdmin.save();
        res.status(201).json({ mensaje: 'Administrador creado con éxito.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el administrador.' });
    }
};

module.exports = { login, registrarPrimerAdmin };