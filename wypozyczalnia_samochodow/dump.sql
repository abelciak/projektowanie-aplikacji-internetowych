-- phpMyAdmin SQL Dump
-- version 4.0.10.10
-- http://www.phpmyadmin.net
--
-- Wersja serwera: 10.0.27-MariaDB-cll-lve
-- Wersja PHP: 5.3.29-dh127

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Baza danych: `aed7ai_samochody`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `auta`
--

CREATE TABLE IF NOT EXISTS `auta` (
  `idAuto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `markaAuto` varchar(30) NOT NULL,
  `modelAuto` varchar(20) NOT NULL,
  `opisAuto` varchar(1000) NOT NULL DEFAULT 'Opis',
  `zdjecieAuto` varchar(200) DEFAULT NULL,
  `cenaAuto` decimal(9,2) NOT NULL DEFAULT '0.00',
  `statusAuto` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idAuto`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

--
-- Zrzut danych tabeli `auta`
--

INSERT INTO `auta` (`idAuto`, `markaAuto`, `modelAuto`, `opisAuto`, `zdjecieAuto`, `cenaAuto`, `statusAuto`) VALUES
(9, 'Lexus', 'GS IV', 'Auto jest wyjątkowe, wyposażone we wszystkie możliwe nowinki technologiczne Lexusa, komfortowe, ciche, mocne i dające ogromną satysfakcję z jazdy.', '98b5216737ec2bbf2a36388afdf0e626', 300.00, 1),
(8, 'Volkswagen', 'Polo 5', 'Auto posiada: półskóry, wszystkie szyby elektryczne, czujniki parkowania, klimatyzowany schowek, wielofunkcyjna kierownica.', 'c55d3af28a65173e0580d1973b403d51', 140.00, 1),
(10, 'Hyundai', 'IX35', 'Skórzane koło kierownicy, regulacja wysokości fotela kierowcy, dzielona tylna kanapa, podłokietnik.', 'f1142a372164e19c9bcf95eeb71ee5cd', 230.00, 0),
(11, 'BMW', 'Seria 5 F10', 'Adaptiver LED najlepsze lampy , Harman Kardon Surround Sound System, Head-Up Display, wirtualne zegary , kamera cofania , M-pakiet x3, Driving Assistant Plus - aktywny tempomat , asystent pasa ruchu , asystent martwego pola ', 'da77ec6353727d6e9ac34f3c61e71247', 350.00, 1),
(12, 'Opel', 'Corsa D', 'Klimatyzacja, podgrzewana skórzana kierownica, podgrzewane fotele, multifunkcyjna kierownica, polskorzana tapicerka, alufelgi, elektryczne szyby i lusterka', 'f1648098452028482e8e8b6845a03cb8', 149.99, 1),
(13, 'Volkswagen', 'Golf VI', 'Poduszki powietrzne, ABS, ASR, zamek centralny, komputer pokladowy, ESP, światła przeciwmgielne, podgrzewane fotele, mocowanie fotelików dziecięcych isofix, elektryczne lusterka, EPS, elektryczne szyby, radio samochodowe', 'bc21f9ba67cc285c0e7d001a85f63cf6', 144.45, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `rezerwacje`
--

CREATE TABLE IF NOT EXISTS `rezerwacje` (
  `idRezerwacja` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `idUzytkownik` int(10) unsigned NOT NULL,
  `idAuto` int(10) unsigned NOT NULL,
  `startRezerwacja` date NOT NULL,
  `koniecRezerwacja` date NOT NULL,
  `statusRezerwacja` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idRezerwacja`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=19 ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `uzytkownicy`
--

CREATE TABLE IF NOT EXISTS `uzytkownicy` (
  `idUzytkownik` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `idDostawca` bigint(20) NOT NULL,
  `dostawcaUzytkownik` varchar(50) NOT NULL,
  `nazwaUzytkownik` varchar(50) NOT NULL,
  `adminUzytkownik` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idUzytkownik`),
  UNIQUE KEY `idDostawca` (`idDostawca`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
