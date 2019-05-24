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
        //console.log('....', accessToken, refreshToken, profile, cb);
        db.query("SELECT * FROM uzytkownicy WHERE idDostawca="+profile.id, (err,rows) => {
            if(err) throw err;

            if(rows && rows.length === 0) {
                //console.log("Dodawanie nowego uzytkownika");
                db.query("INSERT into uzytkownicy(idDostawca,dostawcaUzytkownik,nazwaUzytkownik) VALUES('"+profile.id+"','facebook','"+profile.displayName+"')");
            }
            else {
                //console.log("Uzytkownik juz istnieje");
            }

        });
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

router.get('/wyloguj', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Strona glowna - zakladka w menu
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Strona główna', autoryzacja: req.isAuthenticated(),uzytkownik: req.user });

});

// Samochody - zakladka w menu
router.get('/samochody', function(req, res, next) {

    db.query("SELECT * FROM auta ORDER BY markaAuto ASC, modelAuto ASC", function(error, pokazsamochody){
        res.render('samochodymenu', { pokazsamochody:pokazsamochody, title: 'Samochody',autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
    });
});

// Rezerwacja - zakladka w menu
router.get('/rezerwacja', function(req, res, next) {

    var dzis=new Date().toISOString().slice(0, 10);

    res.render('rezerwacjamenu', { title: 'Rezerwacja', dzis: dzis, danePost:0,autoryzacja: req.isAuthenticated(),uzytkownik: req.user });

});

// Rezerwacja - POST
router.post('/rezerwacja', function(req, res, next) {
    var dzis=new Date().toISOString().slice(0, 10)
    var dataStart=req.body.start;
    var dataKoniec=req.body.koniec;
    var oneDay = 24*60*60*1000;
    var iloscDni=Math.round(Math.abs((new Date(req.body.start).getTime() - new Date(req.body.koniec).getTime())/(oneDay)))+1;

    db.query("SELECT *, cenaAuto*"+iloscDni+" as calkowityKoszt FROM auta ORDER BY markaAuto ASC, modelAuto ASC", function(error, pokazdostepne){

        res.render('rezerwacjamenu', { title: 'Rezerwacja', pokazdostepne:pokazdostepne, dzis: dzis, danePost:1, dataStart:dataStart, dataKoniec:dataKoniec, iloscDni:iloscDni,autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
    });
});

// Rezerwacja - dane z formualarza POST
router.post('/rezerwuj-samochod', function(req, res, next) {
    db.query("SELECT idUzytkownik from uzytkownicy WHERE idDostawca="+req.user.user, (err,rows) => {
        if(err) throw err;

        db.query("INSERT INTO rezerwacje(idUzytkownik,idAuto,startRezerwacja,koniecRezerwacja) VALUES('"+rows[0].idUzytkownik+"','"+req.body.samochod+"','"+req.body.od+"','"+req.body.do+"')", function (err, result) {
            if (err) throw err;

            res.render('rezerwacjapotwierdzenie', { title: 'Rezerwacja',autoryzacja: req.isAuthenticated(),uzytkownik: req.user, numerRezerwacja:result.insertId });
            //console.log("Rezerwacja "+result.insertId);
        });
    });
});

// Rezerwacje użytkownika
router.get('/moje-rezerwacje', function(req, res, next) {
    db.query("SELECT idUzytkownik from uzytkownicy WHERE idDostawca="+req.user.user, (err,rows) => {
        db.query("SELECT * FROM rezerwacje NATURAL JOIN auta WHERE idUzytkownik="+rows[0].idUzytkownik, (err,rows2) => {

            res.render('mojerezerwacje', { title: 'Moje rezerwacje',rezerwacje:rows2.length, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
        });
    });



});

module.exports = router;
