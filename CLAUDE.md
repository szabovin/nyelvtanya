# Nyelvtanya – fejlesztési jegyzet

Játékos nyelvtangyakorló egy 4. osztályos kislánynak (felvételire készül), érintőképernyős laptopra. A testvérprojekt, a Szóláskaland (`C:\CODING\szólásmondás kvíz\szolaskaland`) külön repó, ide nem tartozik.

## Döntések
- Tanya-téma: minden témakör egy pajta (`js/tanya.js` `BARNS`), a pajtában szobák. A kabala **Riska**, szemből rajzolt, kicsit kockafejű tehén (`riska()` SVG a `js/motor.js`-ben). „Muu” hang és „Muu!” szövegek nem kellenek, a felhasználó furcsának találta őket.
- Vanilla HTML/CSS/JS, build nélkül; `index.html` helyben is megnyitható. Élő oldal: GitHub Pages (`szabovin/nyelvtanya`, main ág).
- Szintrendszer 1–6 (6 = mester), minden válasz után magyarázat. Pont = tejesüveg 🥛. A modul `pickKind` listájával szintenként több feladattípus közül sorsol: a felhasználó szerint unalmas volt, hogy az igeragozó 1. szinten mindig csak „Ki csinálja?” jött. Kifejezett kérése: sok kirakás (betűkockák), választás és hibásak megjelölése.
- Igazodás a felvételihez: a feladatsorok linkjei a felhasználó Excel-tervében vannak (oktatas.hu, `A4_<év>_<n>_fl.pdf` / `_ut.pdf`). Az oktatas.hu szkriptből nem engedi letölteni őket, a beépített böngészőből (fetch + pdf.js) viszont olvashatók.
- Ragozó pajta: igeragozás (alanyi, 4 idő/mód) + toldalékok (tő/képző/jel/rag), a felhasználó választása szerint.
- Kiejtés-csapda pajta (`data/kiejt.js`, `js/kiejt.js`): szóelemző írásmód (szaladjon, édesanyja, hullajtjuk, küldték, és a kivételek: olvassa, hozza). A 2026-os felvételik 3. feladata miatt készült, ezt a gyerek elrontotta.

## Az adatok helyessége a legfontosabb
- Minden új szót két forrással ellenőrizni: MTA helyesírási portál (`tools/mta_check.py`) és magyar Hunspell (`tools/hunspell_check.py`, spylls + LibreOffice hu_HU szótár). A j/ly-nál a hibás alakot is: annak mindkettőnél ismeretlennek kell lennie.
- Az MTA-portál a „-tem/-tünk/-tetek” végű múlt idejű alakokra nem ad választ; ezeknél a Hunspell dönt.
- Igeragozás forrása: en.wiktionary ragozási táblái (`tools/wikt_ige.py`, lassan kérdezni, mert 429-et ad), majd `tools/build_ige.py` → `data/ige.js`.
- Toldalékbontás kézi; csak olyan szó kerüljön be, ahol a tő nem változik és nincs hasonulás a határon (a hasonulós szavak a Kiejtés-csapda pajtába valók).
- Kiejtés-csapda: a hibás (kiejtés szerinti) alaknak is ismeretlennek kell lennie mindkét forrásban; ami létező szó (agya, haja, bátya, mennyen), az kimarad. Az MTA-portál a „-ta/-ték” múlt idejű alakokra sem mindig ad választ. A hu_HU szótár nincs a repóban, le kell tölteni (LibreOffice dictionaries).

## Nyitott
- Google-bejelentkezés: a kód kész (`js/fiok.js`, `firestore.rules`), de a Firebase-projektet a felhasználónak kell létrehoznia, és a `firebase-config.js`-be kell beírni a configot (lépések a README-ben).
- A toldalékbontásokat a felhasználó még nem nézte át.
- Új pajták később jönnek (a „Új pajta” helyőrző zárva).
