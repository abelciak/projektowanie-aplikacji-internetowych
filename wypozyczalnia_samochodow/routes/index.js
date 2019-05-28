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
        db.query("SELECT *, DATE_FORMAT(startRezerwacja,'%d.%m.%y') as start," +
            " DATE_FORMAT(koniecRezerwacja,'%d.%m.%y') as koniec, datediff(koniecRezerwacja,startRezerwacja)+1 as" +
            " iloscRezerwacja, cenaAuto*(datediff(koniecRezerwacja,startRezerwacja)+1) as calosc" +
            " FROM rezerwacje NATURAL JOIN auta" +
            " WHERE idUzytkownik="+rows[0].idUzytkownik+" ORDER BY idRezerwacja DESC", (err,rows2) => {

            res.render('mojerezerwacje', { daneRezerwacja:rows2, title: 'Moje rezerwacje',rezerwacje:rows2.length, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
        });
    });
});

// usuwanie rezerwacja (uzytkownik + admin)
router.get('/rezerwacja/usun/:id', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca="+req.user.user, (err,rows) => {
        db.query("SELECT idRezerwacja, idUzytkownik from rezerwacje WHERE idRezerwacja="+req.params.id, (err,rows2) => {
            //console.log("Id biezacego uzytkownika "+rows[0].idUzytkownik);
            //console.log("Admin "+rows[0].adminUzytkownik);
            //console.log("Id rezerwujacego"+rows2[0].idUzytkownik);
            if ((rows[0].idUzytkownik==rows2[0].idUzytkownik) || (rows[0].adminUzytkownik==1))
            {
                var statusUsuniecie=1;
                db.query("DELETE FROM rezerwacje WHERE idRezerwacja='"+req.params.id+"'");
            }
            else
            {
                var statusUsuniecie=0;
            }
            res.render('rezerwacjausun', { title: 'Moje rezerwacje',statusUsuniecie:statusUsuniecie, id:req.params.id, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });

        });
    });
});

// Panel administratora - strona główna
router.get('/admin', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {
        res.render('adminpanel', { title: 'Panel administratora', czyAdmin:rows[0].adminUzytkownik, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
    });
});

// Panel administratora - nadanie uprawnień dla zalogowanego użytkownika
router.get('/admin/nadaj-uprawnienia', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {

        db.query("UPDATE uzytkownicy SET adminUzytkownik=1 WHERE idUzytkownik='"+rows[0].idUzytkownik+"'");
        res.redirect('/admin');
    });
});

// Panel administratora - odebranie uprawnień dla zalogowanego użytkownika
router.get('/admin/odbierz-uprawnienia', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {

        db.query("UPDATE uzytkownicy SET adminUzytkownik=0 WHERE idUzytkownik='"+rows[0].idUzytkownik+"'");
        res.redirect('/admin');
    });
});

// Panel administratora - rezerwacje
router.get('/admin/rezerwacje', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {
        db.query("SELECT *, DATE_FORMAT(startRezerwacja,'%d.%m.%y') as start," +
            " DATE_FORMAT(koniecRezerwacja,'%d.%m.%y') as koniec, datediff(koniecRezerwacja,startRezerwacja)+1 as" +
            " iloscRezerwacja, cenaAuto*(datediff(koniecRezerwacja,startRezerwacja)+1) as calosc" +
            " FROM rezerwacje NATURAL JOIN auta NATURAL JOIN uzytkownicy ORDER BY idRezerwacja DESC", (err,rows2) => {


            res.render('adminrezerwacje', { title: 'Panel administratora', daneRezerwacja:rows2, czyAdmin:rows[0].adminUzytkownik, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
        });
    });
});

// Panel administratora - odrzucenie rezerwacji
router.get('/admin/rezerwacja/odrzuc/:id', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca="+req.user.user, (err,rows) => {
        db.query("SELECT idRezerwacja, idUzytkownik from rezerwacje WHERE idRezerwacja="+req.params.id, (err,rows2) => {
            if (rows[0].adminUzytkownik==1)
            {
                var statusUsuniecie=1;
                db.query("UPDATE rezerwacje set statusRezerwacja=0 WHERE idRezerwacja='"+req.params.id+"'");
            }
            else
            {
                var statusUsuniecie=0;
            }
            res.render('rezerwacjastatus', { title: 'Panel Administratora',statusUsuniecie:statusUsuniecie, id:req.params.id, autoryzacja: req.isAuthenticated(),uzytkownik: req.user, czyAdmin:rows[0].adminUzytkownik });

        });
    });
});

// Panel administratora - potwierdzenie rezerwacji
router.get('/admin/rezerwacja/akceptuj/:id', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca="+req.user.user, (err,rows) => {
        db.query("SELECT idRezerwacja, idUzytkownik from rezerwacje WHERE idRezerwacja="+req.params.id, (err,rows2) => {
            if (rows[0].adminUzytkownik==1)
            {
                var statusUsuniecie=1;
                db.query("UPDATE rezerwacje set statusRezerwacja=1 WHERE idRezerwacja='"+req.params.id+"'");
            }
            else
            {
                var statusUsuniecie=0;
            }
            res.render('rezerwacjastatus', { title: 'Panel Administratora',statusUsuniecie:statusUsuniecie, id:req.params.id, autoryzacja: req.isAuthenticated(),uzytkownik: req.user, czyAdmin:rows[0].adminUzytkownik });

        });
    });
});

// Panel administratora - uzytkownicy
router.get('/admin/uzytkownicy', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {
        db.query("SELECT * FROM uzytkownicy ORDER BY idUzytkownik DESC", (err,rows2) => {

            res.render('adminuzytkownicy', { title: 'Panel administratora', daneUzytkownicy:rows2, czyAdmin:rows[0].adminUzytkownik, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
        });
    });
});

// Panel administratora - flota
router.get('/admin/flota', function(req, res, next) {
    db.query("SELECT adminUzytkownik,idUzytkownik from uzytkownicy WHERE idDostawca=" + req.user.user, (err, rows) => {
        db.query("SELECT * FROM auta ORDER BY idAuto DESC", (err,rows2) => {
            res.render('adminflota', { title: 'Panel administratora', daneFlota:rows2, czyAdmin:rows[0].adminUzytkownik, autoryzacja: req.isAuthenticated(),uzytkownik: req.user });
        });
    });
});

module.exports = router;