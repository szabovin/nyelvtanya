# 🐮 Nyelvtanya

Játékos nyelvtangyakorló 4. osztályosoknak, a felvételire készüléshez. A tanyán pajták vannak, mindegyikben egy-egy témakör; a kabala Riska, a tehén.
Érintőképernyőn is kényelmesen játszható.

**▶ Játék:** https://szabovin.github.io/nyelvtanya/

## Pajták

### 🐔 J/LY pajta (140 szó)
Állatok, növények, tárgyak, helyek, „ilyen-olyan” szavak, csalóka j-s szavak (olaj, talaj, papagáj) és az lj-s igealakok (tolja, hallja).

### 🐴 Ragozó pajta
- **Igeragozó** (60 ige × jelen idő, múlt idő, feltételes mód, felszólító mód, alanyi ragozás), külön szobában a rendhagyó igék (megy, jön, van, eszik…)
- **Toldalékoló** (79 szó): tő, képző, jel, rag

## Hogyan tanít?

Minden szónak van egy szintje 1-től 6-ig. Jó válasz után a szó szintet lép, és egyre nehezebb feladattípusban jön elő; rossz válasz után visszalép egyet, és még ugyanabban a körben újra előkerül. Minden válasz után megjelenik a magyarázat.

| Szint | J/LY pajta | Igeragozó | Toldalékoló |
|---|---|---|---|
| 1 | Melyik a helyes? (2 alak) | Ki csinálja? | Képző, jel vagy rag? |
| 2 | Pótold a betűt | Melyik idő vagy mód? | Mi a szó töve? |
| 3 | Záp tojás: melyik a hibás? | Ragozd! | Mit jelent a toldalék? |
| 4 | Válogató: az összes hibás | Időgép: tedd át más időbe | Vágd szét a szót! |
| 5 | Villanókártya + betűkirakó | Betűkirakó | Színezd ki a szóelemeket! |
| 6 | ⭐ mester: vegyes feladatok, ritkábban | | |

A pontok neve tejesüveg 🥛; van kombószorzó, napi sorozat és rangok (Tanyasi csemetétől Nyelvtanya-mesterig).

## Honnan tudjuk, hogy helyesek az adatok?

- **J/LY:** minden szót és a hibás párját is lekérdeztük az MTA (HUN-REN) helyesírási portálján ([helyesiras.mta.hu](https://helyesiras.mta.hu)). Csak az maradt bent, ahol a helyes alak „helyes”, a hibás „ismeretlen”. Kimaradt minden pár, ahol a hibás alak is létező szó (csuklya – csukja, hely – hej, sújt – súlyt).
- **Igeragozás:** a táblák az angol Wikiszótár ([en.wiktionary.org](https://en.wiktionary.org)) ragozási tábláiból jönnek, és minden alakot az MTA-portálon is lekérdeztünk. A „van” igét kézzel vettük fel, az alakjait szintén a portál ellenőrizte.
- **Toldalékok:** a szóelemekre bontást kézzel készítettük az alsós nyelvtan fogalmai szerint (képző, jel, rag), a szavak helyesírását az MTA-portál ellenőrizte. Csak olyan szavak kerültek be, ahol a tő nem változik meg (nincs fa → fá-), és a hasonulás sem mossa össze a határokat.

Az ellenőrző szkriptek a `tools/` mappában vannak. Ha hibát találsz, nyiss egy issue-t.

## Haladás mentése

Alapból a böngésző menti (localStorage), külön minden gépen. Google-bejelentkezéssel a haladás a felhőbe is mentődik (Firebase), így minden gépen megvan; belépéskor a gépen lévő és a felhőben lévő eredményeket összefésüli, mindig a jobbat tartja meg.

### A Google-bejelentkezés beállítása (egyszer kell)

1. A [Firebase-konzolon](https://console.firebase.google.com) hozz létre egy projektet (például `nyelvtanya`). A Google Analytics kikapcsolható.
2. **Build → Authentication → Get started → Sign-in method:** kapcsold be a **Google** szolgáltatót.
3. **Authentication → Settings → Authorized domains:** add hozzá: `szabovin.github.io`.
4. **Build → Firestore Database → Create database:** production mode, a helyszín legyen `eur3 (europe-west)`.
5. **Firestore → Rules:** másold be a [`firestore.rules`](firestore.rules) tartalmát, és nyomd meg a Publish gombot.
6. **Project settings → Your apps → Web (`</>`):** regisztrálj egy webalkalmazást, és a kapott `firebaseConfig` objektumot másold a [`firebase-config.js`](firebase-config.js) fájlba a `null` helyére.

A `firebase-config.js` adatai nem titkosak; a hozzáférést a Firestore-szabályok védik (mindenki csak a saját haladását látja). A bejelentkezés csak a weboldalon működik, helyben megnyitott fájlból nem.

## Futtatás helyben

Töltsd le a fájlokat, és nyisd meg az `index.html`-t a böngészőben. Bejelentkezés nélkül így is teljesen játszható.

## Új pajta hozzáadása

Egy pajta egy vagy több modulból áll (`js/jly.js`, `js/ige.js`, `js/toldalek.js` a minta). Egy modul `registerModule({...})`-lal jelentkezik be: megadja a szobáit, az elemeit és az öt szint feladattípusait; a körök, a pontozás és a mentés a közös motorban (`js/motor.js`) van. Az új pajtát a `js/tanya.js` `BARNS` listájába kell felvenni.

## Felépítés

| Fájl | Tartalom |
|---|---|
| `index.html` | képernyők és stílusok |
| `js/motor.js` | közös motor: mentés, körök, pontozás, hangok |
| `js/tanya.js` | a tanya, a pajták, a szülői sarok |
| `js/jly.js`, `js/ige.js`, `js/toldalek.js` | a modulok feladattípusai |
| `js/fiok.js`, `firebase-config.js`, `firestore.rules` | Google-bejelentkezés és felhőmentés |
| `data/` | szólisták és ragozási táblák |
| `tools/` | az adatok ellenőrzésére és előállítására szolgáló szkriptek |
