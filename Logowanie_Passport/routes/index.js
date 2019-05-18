var express = require('express');
var router = express.Router();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

//fb
passport.use(new FacebookStrategy({
      clientID: "#",
      clientSecret: "#",
      callbackURL: "http://localhost:3000/auth/facebook/callback"
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

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));


/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('.......', req.user, req.isAuthenticated());
  //res.render('index', {title: 'Express', user: req.user});
  res.write('Kliknij aby zalogowac -> <a href="/auth/facebook">Zaloguj</a>');
});


// metoda ktora jest dostepna tylko dla zalogownaych
router.get('/test', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  res.write(' test');
  res.end();
});


router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;