// Nyelvtanya – Google-bejelentkezés és felhőmentés (Firebase Authentication + Cloud Firestore)
// A haladás a users/{uid} dokumentumban van; a firestore.rules szerint mindenki csak a sajátját éri el.

const CFG = window.NT_FIREBASE;
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

if (CFG && location.protocol.startsWith('http')) {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')
  ]);
  const app = initializeApp(CFG);
  const auth = A.getAuth(app), db = F.getFirestore(app);
  auth.languageCode = 'hu';
  let user = null, timer = null, status = '';

  const ref = () => F.doc(db, 'users', user.uid);
  async function push() {
    if (!user) return;
    try { await F.setDoc(ref(), { state: JSON.stringify(S), updated: F.serverTimestamp() }); status = 'Mentve a felhőbe: ' + new Date().toLocaleTimeString('hu-HU'); }
    catch (e) { status = 'A felhőmentés nem sikerült: ' + e.code; console.warn(e); }
  }
  SAVE_HOOKS.push(() => { clearTimeout(timer); timer = setTimeout(push, 1500); });

  async function login() {
    const prov = new A.GoogleAuthProvider();
    try { await A.signInWithPopup(auth, prov); }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') await A.signInWithRedirect(auth, prov);
      else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') alert('A bejelentkezés nem sikerült: ' + e.code);
    }
  }

  A.onAuthStateChanged(auth, async u => {
    user = u;
    if (!u) { status = ''; return; }
    try {
      const snap = await F.getDoc(ref());
      if (snap.exists()) {
        const changed = mergeState(JSON.parse(snap.data().state));
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
        if (changed && !document.querySelector('#s-quiz.on')) home();
      }
      await push();
    } catch (e) { status = 'A felhőből nem sikerült betölteni: ' + e.code; console.warn(e); }
    if (!S.name && u.displayName) { S.name = u.displayName.split(' ').pop(); save(); home(); }
  });

  window.NT_cloudInfo = () => user
    ? `☁️ A haladás a(z) <b>${esc(user.email)}</b> fiókba is mentődik, így minden gépen megvan. ${esc(status)}`
    : 'A haladás most csak ezen a gépen van elmentve. Jelentkezz be Google-fiókkal a Fiók gombbal, hogy minden gépen meglegyen!';

  window.NT_account = () => {
    if (user) {
      modal(`<h2>👤 Fiók</h2><p>Bejelentkezve: <b>${esc(user.displayName || '')}</b><br>${esc(user.email)}</p><p class="hint" style="text-align:left">${esc(status)}</p>
        <div class="opts g2"><button class="opt sm" id="a-sync">☁️ Mentés most</button><button class="opt sm" id="a-out">🚪 Kijelentkezés</button></div><button class="nextbtn" data-close>Bezár</button>`);
      document.querySelector('#a-sync').onclick = async () => { await push(); window.NT_account(); };
      document.querySelector('#a-out').onclick = async () => { await push(); await A.signOut(auth); closeModal(); };
    } else {
      modal(`<h2>👤 Fiók</h2><p>Jelentkezz be Google-fiókkal, és a haladás minden gépen meglesz. A gépen eddig gyűjtött eredmények sem vesznek el: összefésülöm őket a felhőben lévőkkel.</p>
        <button class="nextbtn" id="a-in" style="background:#4285f4;box-shadow:0 6px 0 #1a56c4">Belépés Google-fiókkal</button><button class="nextbtn y" data-close>Most nem</button>`);
      document.querySelector('#a-in').onclick = async () => { closeModal(); await login(); };
    }
  };
  const ng = document.querySelector('#name-google');
  ng.innerHTML = '<button class="ghost g" id="ng-in">Belépés Google-fiókkal</button>';
  document.querySelector('#ng-in').onclick = login;
} else if (CFG) {
  window.NT_cloudInfo = () => 'A Google-bejelentkezés csak a weboldalon működik (például GitHub Pages-en), helyben megnyitott fájlból nem. A haladás most a böngészőben mentődik.';
}
