// Nyelvtanya – Toldalékpajta adatai
// Egy szó: szóelemek „|” jellel elválasztva. A tő jelölés nélkül áll,
// a toldalékok után „:típus:szerep” jön (k = képző, j = jel, r = rag).
// Csak olyan szavak vannak benne, amelyekben a tő nem változik meg (nincs fa → fá-),
// és a hasonulás sem mossa össze a határt (nincs kéz + vel → kézzel).
// Minden szó helyesírását az MTA helyesírási portálja ellenőrizte (tools/mta_check.py).

const SZEREP = {
  // képzők
  fogl: 'foglalkozást jelöl: aki ezzel foglalkozik',
  cselnev: 'a cselekvés nevét képzi meg',
  tulnev: 'a tulajdonság nevét képzi meg',
  ellat: 'azt jelenti: valamivel ellátott, valami van rajta vagy benne',
  hiany: 'azt jelenti: valami hiányzik belőle',
  tart: 'azt jelenti: valahová vagy valamikorra tartozó',
  lehet: 'azt jelenti: lehetséges, szabad vagy képes megtenni',
  ism: 'azt jelenti: újra meg újra, apránként csinálja',
  kics: 'kicsinyít: kis valamit jelent',
  csin: 'azt jelenti: aki vagy ami csinálja',
  // jelek
  tsz: 'a többes szám jele: több van belőle',
  kozep: 'a középfok jele: valaminél jobban',
  felso: 'a felsőfok jele: a középfok jelével együtt azt jelenti, mindenkinél jobban',
  mult: 'a múlt idő jele: már megtörtént',
  felt: 'a feltételes mód jele: csak megtörténne',
  felsz: 'a felszólító mód jele: kérés vagy parancs',
  // ragok
  hol: 'helyhatározó rag: hol? kérdésre felel',
  honnan: 'helyhatározó rag: honnan? kérdésre felel',
  hova: 'helyhatározó rag: hová? kihez? kérdésre felel',
  targy: 'tárgyrag: kit? mit? kérdésre felel',
  kinek: 'részeshatározó rag: kinek? minek? kérdésre felel',
  mivel: 'eszközhatározó rag: kivel? mivel? kérdésre felel',
  szemely: 'igei személyrag: megmutatja, ki csinálja'
};

const TOLDALEK = [
  // csak képző
  'kert|ész:k:fogl', 'hal|ász:k:fogl', 'olvas|ás:k:cselnev', 'ír|ás:k:cselnev', 'fut|ás:k:cselnev',
  'szép|ség:k:tulnev', 'boldog|ság:k:tulnev', 'só|s:k:ellat', 'szőr|ös:k:ellat', 'hegy|es:k:ellat',
  'bátor|talan:k:hiany', 'szív|telen:k:hiany', 'kert|i:k:tart', 'tavasz|i:k:tart', 'est|i:k:tart',
  'olvas|hat:k:lehet', 'kér|het:k:lehet', 'rajzol|gat:k:ism', 'ház|ikó:k:kics', 'lány|ka:k:kics',
  'fest|ő:k:csin', 'ír|ó:k:csin', 'süt|ő:k:csin',
  // csak jel
  'ház|ak:j:tsz', 'kert|ek:j:tsz', 'szék|ek:j:tsz', 'fiú|k:j:tsz', 'autó|k:j:tsz', 'virág|ok:j:tsz', 'toll|ak:j:tsz',
  'nagy|obb:j:kozep', 'kis|ebb:j:kozep', 'okos|abb:j:kozep', 'leg:j:felso|nagy|obb:j:kozep', 'leg:j:felso|okos|abb:j:kozep',
  'olvas|ott:j:mult', 'lát|ott:j:mult', 'ül|t:j:mult', 'kér|t:j:mult',
  'olvas|na:j:felt', 'néz|ne:j:felt', 'kér|j:j:felsz', 'dob|j:j:felsz',
  // csak rag
  'ház|ban:r:hol', 'kert|ben:r:hol', 'erdő|ben:r:hol', 'asztal|on:r:hol', 'pad|on:r:hol',
  'kert|ből:r:honnan', 'ház|ból:r:honnan', 'ház|hoz:r:hova', 'kert|et:r:targy', 'autó|t:r:targy', 'fiú|t:r:targy',
  'barát|nak:r:kinek', 'autó|val:r:mivel', 'fiú|val:r:mivel', 'olvas|ok:r:szemely', 'lát|unk:r:szemely', 'kér|sz:r:szemely', 'kér|ek:r:szemely',
  // több toldalék
  'kert|ész:k:fogl|ek:j:tsz', 'hal|ász:k:fogl|ok:j:tsz', 'ír|ás:k:cselnev|ok:j:tsz', 'kert|ek:j:tsz|ben:r:hol', 'ház|ak:j:tsz|ban:r:hol',
  'autó|k:j:tsz|on:r:hol', 'virág|ok:j:tsz|at:r:targy', 'olvas|t:j:mult|am:r:szemely', 'lát|t:j:mult|unk:r:szemely', 'kér|t:j:mult|él:r:szemely',
  'olvas|né:j:felt|k:r:szemely', 'néz|né:j:felt|nk:r:szemely', 'tanul|hat:k:lehet|ok:r:szemely', 'kert|ész:k:fogl|ek:j:tsz|et:r:targy',
  'fest|ő:k:csin|k:j:tsz|nek:r:kinek', 'nagy|obb:j:kozep|ak:j:tsz', 'kis|ebb:j:kozep|et:r:targy', 'szép|ség:k:tulnev|ben:r:hol'
];
