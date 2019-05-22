var express = require('express');
var router = express.Router();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
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

passport.use(new FacebookStrategy({
        clientID: '*',   // ID do facebooka
        clientSecret: '*', // klucz do facbooka
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log('....', accessToken, refreshToken, profile, cb);
        // Tu należy sprawdzić czy dane w obiekcie "profile" ktory otzymujamy z z FB
        // mamy juz w bazie dancyh a jesli nie to utworzyc nowego uzytkowniaka
        // w związku z tym że ja nie mam bazy danych użytkowników
        // to nie sprawdzam tego w bazie tylko tworze sobie tymczasowy obiekt
        // z informają z progilu
        return cb(null, {
            user: profile.id,
            name: profile.displayName,
            status: 1
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);

});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

router.get('/zaloguj', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

// metoda ktora jest dostepna tylko dla zalogownaych
router.get('/test', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
    }

    res.write(' test');
    res.end();
});

router.get('/wyloguj', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Strona glowna - zakladka w menu
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Strona główna', autoryzacja: req.isAuthenticated() });

});

// Samochody - zakladka w menu
router.get('/samochody', function(req, res, next) {
    var zapytaniePokazSamochody="SELECT * FROM auta ORDER BY markaAuto ASC, modelAuto ASC";
    db.query(zapytaniePokazSamochody, function(error, pokazsamochody){
        res.render('samochodymenu', { pokazsamochody:pokazsamochody, title: 'Samochody',autoryzacja: req.isAuthenticated() });
    });
});

// Rezerwacja - zakladka w menu
router.get('/rezerwacja', function(req, res, next) {
    var dzis=new Date().toISOString().slice(0, 10)
    res.render('rezerwacjamenu', { title: 'Rezerwacja', dzis: dzis, danePost:0,autoryzacja: req.isAuthenticated() });
});

// Rezerwacja - POST
router.post('/rezerwacja', function(req, res, next) {
    var dzis=new Date().toISOString().slice(0, 10)
    var dataStart=req.body.start;
    var dataKoniec=req.body.koniec;
    var oneDay = 24*60*60*1000;
    var iloscDni=Math.round(Math.abs((new Date(req.body.start).getTime() - new Date(req.body.koniec).getTime())/(oneDay)))+1;
    var zapytaniePokazDostepneSamochody="SELECT *, cenaAuto*"+iloscDni+" as calkowityKoszt FROM auta ORDER BY markaAuto ASC, modelAuto ASC";
    db.query(zapytaniePokazDostepneSamochody, function(error, pokazdostepne){
        res.render('rezerwacjamenu', { title: 'Rezerwacja', pokazdostepne:pokazdostepne, dzis: dzis, danePost:1, dataStart:dataStart, dataKoniec:dataKoniec, iloscDni:iloscDni,autoryzacja: req.isAuthenticated() });
    });
});



module.exports = router;
