var express = require('express');
var router = express.Router();
const fs=require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test1', function(req, res, next) {
  res.end("Witaj swiecie - Test1");
});

router.get('/test2', function(req, res, next) {
    res.end("Adres -> "+req.url);
});

router.get('/book/:bookId', function(req, res, next) {
    res.end("Book ID = "+req.params.bookId);
});

router.post('/book/add', function(req, res, next) {
    res.end("Add book = "+req.body.imie);
});
// http://localhost:3000/book?tytul=ksiazka
router.get('/book', function(req, res, next) {
    res.end("Book nazwa = "+req.query.tytul);
});

//
// Powitanie
//

// http://localhost:3000/powitanie/Adrian/18
router.get('/powitanie/:imie/:wiek', function(req, res, next) {
    res.render('powitanie', { imie: req.params.imie, wiek: req.params.wiek});
});

// http://localhost:3000/powitanie?imie=Andrzej&wiek=19
router.get('/powitanie', function(req, res, next) {
    res.render('powitanie', { imie: req.query.imie, wiek: req.query.wiek});
});

// formularz dla wysylki POST
// http://localhost:3000/powitanie/formularz
router.get('/powitanie/formularz', function(req, res, next) {
    res.render('powitanie_formularz');
});

// odbieranie POST
// http://localhost:3000/powitanie/wyslij
router.post('/powitanie/wyslij', function(req, res, next) {
    res.render('powitanie', { imie: req.body.imie, wiek: req.body.wiek});
});

router.get('/index1', function(req, res, next) {
  fs.readFile('html/index1.html',(err, d) => {
    res.write(d);
    res.end();
  });
});

module.exports = router;
