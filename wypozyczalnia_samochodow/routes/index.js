var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// Dane do polaczenia z baza danych
var db=mysql.createConnection(
    {
      host: '*',
      user: '*',
      password: '*',
      database: '*'
    });
db.connect();

// Strona glowna - zakladka w menu
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Strona główna' });
});

// Samochody - zakladka w menu
router.get('/samochody', function(req, res, next) {
    var zapytaniePokazSamochody="SELECT * FROM auta ORDER BY markaAuto ASC, modelAuto ASC";
    db.query(zapytaniePokazSamochody, function(error, pokazsamochody){
        res.render('samochodymenu', { pokazsamochody:pokazsamochody, title: 'Samochody' });
    });
});

// Rezerwacja - zakladka w menu
router.get('/rezerwacja', function(req, res, next) {
    var dzis=new Date().toISOString().slice(0, 10)
    res.render('rezerwacjamenu', { title: 'Rezerwacja', dzis: dzis, danePost:0 });
});

// Rezerwacja - POST
router.post('/rezerwacja', function(req, res, next) {
    var dzis=new Date().toISOString().slice(0, 10)
    var dataStart=req.body.start;
    var dataKoniec=req.body.koniec;
    var oneDay = 24*60*60*1000;
    var iloscDni=Math.round(Math.abs((new Date(req.body.start).getTime() - new Date(req.body.koniec).getTime())/(oneDay)))+1;
    console.log(iloscDni);
    var zapytaniePokazDostepneSamochody="SELECT *, cenaAuto*"+iloscDni+" as calkowityKoszt FROM auta ORDER BY markaAuto ASC, modelAuto ASC";
    db.query(zapytaniePokazDostepneSamochody, function(error, pokazdostepne){
        res.render('rezerwacjamenu', { title: 'Rezerwacja', pokazdostepne:pokazdostepne, dzis: dzis, danePost:1, dataStart:dataStart, dataKoniec:dataKoniec, iloscDni:iloscDni });
    });
});


module.exports = router;
