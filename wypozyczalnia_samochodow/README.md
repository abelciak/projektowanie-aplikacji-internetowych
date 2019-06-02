# O projekcie

Projekt wykonany w technologiach:
- Node.js
- PUG
- MySQL
- Bootstrap

## Instrukcja
- Zaimportować plik SQL do bazy danych MySQL (plik dump.sql)
- Ustawić dane do połączenia z bazą danych (plik routes/index.js)
```javascript
var db=mysql.createConnection(
    {
      host: '*',
      user: '*',
      password: '*',
      database: '*'
    });
```
- Ustawić dklucz wygenerowany do API Facebooka (plik routes/index.js)
```javascript
passport.use(new FacebookStrategy({
        clientID: '*',   // ID do facebooka
        clientSecret: '*', // klucz do facbooka
```
- Uruchomić adres w przeglądarce http://localhost:3000

## Funkcjonalność użytkownika
- Możliwość zalogowania przez Facebooka (konto generuje się automatycznie po kliknięciu "Zaloguj się")
- Możliwość rezerwacji samochodu (wybór początku oraz końca dnia rezerwacji)
- Możliwość podglądu swoich rezerwacji (oraz usunięcie)

## Funkcjonalność administratora
- Zarządzania flotą (samochodami) - dodawanie oraz modyfikacja: marka, model, cena (1 dzień), upload zdjęcia, deaktywacja/aktywacja samochodu
- Zarządzanie rezerwacjami - podgląd rezerwacji, usuwanie, akceptowanie oraz odrzucanie
- Zarządzanie użytkownikami - podgląd listy użytkowników

Ze względów technicznych administratorem może być każdy użytkownik. W tym celu stworzona została możliwość nadania uprawnień dla siebie lub odebrania. Wystarczy kliknąć w panel administratora - osoby bez funkcji administratora nie mogą wykonywać operacji administratora. Jednak prawa administratora można sobie nadać w dowolnym momencie.