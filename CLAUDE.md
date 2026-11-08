# Nyelvtanya – fejlesztési jegyzet

Játékos nyelvtangyakorló egy 4. osztályos kislánynak (felvételire készül), érintőképernyős laptopra. A testvérprojekt, a Szóláskaland (`C:\CODING\szólásmondás kvíz\szolaskaland`) külön repó, ide nem tartozik.

## Döntések
- Tanya-téma: minden témakör egy pajta (`js/tanya.js` `BARNS`), a pajtában szobák. A kabala **Riska**, szemből rajzolt, kicsit kockafejű tehén (`riska()` SVG a `js/motor.js`-ben). „Muu” hang és „Muu!” szövegek nem kellenek, a felhasználó furcsának találta őket.
- Vanilla HTML/CSS/JS, build nélkül; `index.html` helyben is megnyitható. Élő oldal: GitHub Pages (`szabovin/nyelvtanya`, main ág).
- Szintrendszer 1–6 (6 = mester), szintenként más feladattípus, minden válasz után magyarázat. Pont = tejesüveg 🥛.
- Ragozó pajta: igeragozás (alanyi, 4 idő/mód) + toldalékok (tő/képző/jel/rag), a felhasználó választása szerint.

## Az adatok helyessége a legfontosabb
- Minden új szót két forrással ellenőrizni: MTA helyesírási portál (`tools/mta_check.py`) és magyar Hunspell (`tools/hunspell_check.py`, spylls + LibreOffice hu_HU szótár). A j/ly-nál a hibás alakot is: annak mindkettőnél ismeretlennek kell lennie.
- Az MTA-portál a „-tem/-tünk/-tetek” végű múlt idejű alakokra nem ad választ; ezeknél a Hunspell dönt.
- Igeragozás forrása: en.wiktionary ragozási táblái (`tools/wikt_ige.py`, lassan kérdezni, mert 429-et ad), majd `tools/build_ige.py` → `data/ige.js`.
- Toldalékbontás kézi; csak olyan szó kerüljön be, ahol a tő nem változik és nincs hasonulás a határon.

## Nyitott
- Google-bejelentkezés: a kód kész (`js/fiok.js`, `firestore.rules`), de a Firebase-projektet a felhasználónak kell létrehoznia, és a `firebase-config.js`-be kell beírni a configot (lépések a README-ben).
- A toldalékbontásokat a felhasználó még nem nézte át.
- Új pajták később jönnek (a „Új pajta” helyőrző zárva).
