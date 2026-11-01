var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('pacientes/vwLstPacientes', {
        title: 'Pacientes',
        showNavbar: true,
        activeMenu: 'pacientes',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('pacientes/vwFormPacientes', {
        title: 'Formulário de pacientes',
        showNavbar: true,
        activeMenu: 'pacientes',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;