const express = require('express');
const router = express.Router();

// Como ya pasó por los middlewares globales, req.usuario ya tiene los datos de Windows
router.get('/mi-sesion', (req, res) => {
    res.json(req.usuario);
});

module.exports = router;