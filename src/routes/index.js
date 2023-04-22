const express = require("express");
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});



router.get('/home', function(req, res, next) {
    res.render('index', { title: 'This is home page' });
});


module.exports = router;
