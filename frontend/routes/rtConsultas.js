var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('consultas/vwLstConsultas', {
        title: 'Consultas médicas',
        showNavbar: true,
        activeMenu: 'consultas',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('consultas/vwFormConsultas', {
        title: 'Formulário de consultas',
        showNavbar: true,
        activeMenu: 'consultas',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;