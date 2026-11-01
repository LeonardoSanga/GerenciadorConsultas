var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('login', {
        title: 'Login',
        showNavbar: false,
        servidor: process.env.SERVIDOR
    });
});

router.post('/', function(req, res) {
    res.redirect('/home');
});

module.exports = router;
