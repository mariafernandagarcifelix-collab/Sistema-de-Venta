const express = require('express');
const router = express.Router();

// Importamos a nuestro "cadenero" (el escáner de gafetes)
const { ssoMiddleware } = require('../middlewares/auth');

// Importamos el controlador que acabamos de crear
const { loginSSO, logout } = require('../controllers/authController');

// La ruta que el frontend va a llamar automáticamente apenas abra la página
// OJO: Primero pasa por el ssoMiddleware y luego llega al loginSSO
router.get('/me', ssoMiddleware, loginSSO);

router.post('/logout', logout);

module.exports = router;