'use strict';
// Nyelvtanya – a tanya: pajták, kezdőképernyő, szülői sarok

const BARNS = [
  { id: 'jly', name: 'J/LY pajta', sub: 'mosoly vagy mosoj?', mods: ['jly'], wall: '#dc2626', roof: '#7f1d1d', animal: '🐔' },
  { id: 'rag', name: 'Ragozó pajta', sub: 'igék, képzők, jelek, ragok', mods: ['ige', 'toldalek'], wall: '#2563eb', roof: '#1e3a8a', animal: '🐴' },
  { id: 'kiejt', name: 'Kiejtés-csapda pajta', sub: 'szaladjon, nem szalaggyon!', mods: ['kiejt'], wall: '#0d9488', roof: '#134e4a', animal: '🦆' },
  { id: 'soon1', name: 'Új pajta', sub: 'hamarosan épül…', mods: [], wall: '#a16207', roof: '#713f12', animal: '🐑' }
];
const barnOf = modId => BARNS.find(b => b.mods.includes(modId));

function barnSVG(b) {
  return `<svg viewBox="0 0 220 180" aria-hidden="true">
    <rect x="18" y="150" width="184" height="14" rx="7" fill="rgba(0,0,0,.12)"/>
    <polygon points="110,8 206,72 14,72" fill="${b.roof}"/>
    <rect x="30" y="68" width="160" height="88" fill="${b.wall}"/>
    <rect x="30" y="68" width="160" height="8" fill="rgba(0,0,0,.15)"/>
    <circle cx="110" cy="46" r="15" fill="#fef3c7" stroke="#fff" stroke-width="4"/>
    <text x="110" y="53" font-size="18" text-anchor="middle">${b.animal}</text>
    <rect x="78" y="96" width="64" height="60" fill="#fff"/>
    <rect x="84" y="102" width="52" height="54" fill="${b.roof}"/>
    <path d="M84 102 L136 156 M136 102 L84 156" stroke="#fff" stroke-width="5"/>
    <rect x="42" y="88" width="24" height="22" fill="#fff"/><rect x="46" y="92" width="16" height="14" fill="#fde68a"/>
    <rect x="154" y="88" width="24" height="22" fill="#fff"/><rect x="158" y="92" width="16" height="14" fill="#fde68a"/>
  </svg>`;
}

function home() {
  if (!S.name) { show('s-name'); setTimeout(() => $('#nameinput').focus(), 50); return; }
  const ri = rankOf(S.milk), r = RANKS[ri], nx = RANKS[ri + 1];
  $('#riska-says').textContent = `Szia, ${S.name}! ` + pick(['Jó, hogy itt vagy!', 'Melyik pajtába megyünk ma?', 'Már vártalak!', 'Gyakoroljunk egy kicsit!']);
  $('#h-milk').textContent = S.milk;
  $('#h-streak').textContent = liveStreak() + ' nap';
  $('#h-rank').textContent = r[2] + ' ' + r[1] + (nx ? ` · még ${nx[0] - S.milk} 🥛` : '');
  $('#h-rank').title = nx ? `Következő rang: ${nx[2]} ${nx[1]}` : 'Elérted a legmagasabb rangot!';
  $('#b-sound').textContent = S.sound ? '🔊 Hang: be' : '🔇 Hang: ki';
  $('#barns').innerHTML = BARNS.map(b => {
    const mods = b.mods.map(modById).filter(Boolean);
    const st = mods.map(modStats), stars = st.length ? Math.round(st.reduce((a, s) => a + s.pct, 0) / st.length * 100) : 0;
    return `<button class="barnbtn ${mods.length ? '' : 'locked'}" data-b="${b.id}">
      ${mods.length ? `<span class="stars">${stars}% ⭐</span>` : ''}
      ${barnSVG(b)}<span class="bname">${esc(b.name)}</span><span class="bsub">${esc(b.sub)}</span></button>`;
  }).join('');
  document.querySelectorAll('.barnbtn').forEach(el => el.onclick = () => {
    const b = BARNS.find(x => x.id === el.dataset.b);
    if (!b.mods.length) { modal(`<div class="center"><div class="cow">${riska()}</div><h2>Ez a pajta még épül!</h2><p class="hello">Hamarosan új feladatok költöznek ide.</p><button class="nextbtn" data-close>Rendben</button></div>`); return; }
    openBarn(b.id);
  });
  show('s-farm');
}

function openBarn(id) {
  const b = BARNS.find(x => x.id === id) || barnOf(id);
  const mods = b.mods.map(modById).filter(Boolean);
  $('#barn-title').textContent = b.animal + ' ' + b.name;
  $('#barn-intro').innerHTML = `<span class="cow sm" style="float:left;margin:0 12px 4px 0">${riska()}</span>` + mods.map(m => esc(m.intro)).join('<br><br>');
  $('#rooms').innerHTML = mods.map(m => `
    ${mods.length > 1 ? `<h3 style="grid-column:1/-1;margin:8px 0 -4px;font-size:24px">${m.emoji} ${esc(m.name)}</h3>` : ''}
    ${m.rooms.map(r => { const s = roomStats(m, r); return `<button class="room ${r.cls}" data-m="${m.id}" data-r="${r.id}">
      <span class="ic">${r.ic}</span>${esc(r.name)}
      <small>${s.total} feladat · ${s.master} mester ⭐ · ${'★'.repeat(s.stars)}${'☆'.repeat(3 - s.stars)}</small>
      <div class="bar"><i style="width:${Math.round(s.pct * 100)}%"></i></div></button>`; }).join('')}
    <button class="room c5" data-album="${m.id}" style="padding:12px 18px"><span>📖 ${esc(m.name)}: az összes szó</span></button>`).join('');
  document.querySelectorAll('#rooms .room[data-r]').forEach(el => el.onclick = () => startRound(el.dataset.m, el.dataset.r));
  document.querySelectorAll('#rooms .room[data-album]').forEach(el => el.onclick = () => album(el.dataset.album));
  show('s-barn');
}
document.querySelectorAll('.back').forEach(b => b.onclick = home);

const LV_ICON = ['⚪', '🥚', '🐣', '🐥', '🐔', '🐓', '⭐'];
function album(modId) {
  const m = modById(modId);
  modal(`<h2>📖 ${esc(m.name)}</h2><p class="hint" style="text-align:left">${LV_ICON.map((c, i) => c + ' ' + (i === 0 ? 'még nem láttad' : i === 6 ? 'mester' : i + '. szint')).join(' · ')}</p>` +
    m.album().map(([title, rows]) => `<h3>${esc(title)}</h3><table class="list">${rows.map(([id, txt]) => `<tr><td style="width:34px">${LV_ICON[lvl(m.id, id)]}</td><td>${esc(txt)}</td></tr>`).join('')}</table>`).join('') +
    `<button class="nextbtn" data-close>Bezár</button>`);
}

$('#namego').onclick = () => {
  const n = $('#nameinput').value.trim();
  if (!n) { $('#nameinput').focus(); return; }
  S.name = n; save(); SND.win(); home();
};
$('#nameinput').addEventListener('keydown', e => { if (e.key === 'Enter') $('#namego').click(); });
$('#b-sound').onclick = () => { S.sound = !S.sound; save(); home(); };

$('#b-parent').onclick = () => {
  const rows = MODULES.map(m => {
    const s = modStats(m);
    const worst = Object.entries(S.mods[m.id] || {}).filter(([, p]) => p.w > 0).sort((a, b) => b[1].w - a[1].w).slice(0, 8);
    return `<h3>${m.emoji} ${esc(m.name)}</h3><p>${s.seen} / ${s.total} elem gyakorolva, ${s.master} mester szinten (${Math.round(s.pct * 100)}%).</p>` +
      (worst.length ? `<p class="hint" style="text-align:left">Legtöbbször elrontva: ${worst.map(([id, p]) => `<b>${esc(m.label(id))}</b> (${p.w}×)`).join(', ')}</p>` : '');
  }).join('');
  modal(`<h2>👪 Szülői sarok</h2><p><b>${esc(S.name)}</b> · 🥛 ${S.milk} · 🔥 ${liveStreak()} nap</p>${rows}
    <p class="hint" style="text-align:left">${window.NT_cloudInfo ? window.NT_cloudInfo() : 'A haladás ezen a gépen, a böngészőben van elmentve.'}</p>
    <div class="opts g2"><button class="opt sm" id="p-rename">✏️ Név módosítása</button><button class="opt sm" id="p-reset" style="color:var(--bad)">🗑️ Nullázás</button></div>
    <button class="nextbtn" data-close>Bezár</button>`);
  $('#p-rename').onclick = () => { const n = prompt('Új név:', S.name); if (n && n.trim()) { S.name = n.trim(); save(); closeModal(); home(); } };
  $('#p-reset').onclick = () => {
    if (!confirm('Biztosan törlöd az összes haladást? Ezt nem lehet visszavonni.')) return;
    const keep = { name: S.name, sound: S.sound };
    S = Object.assign(blank(), keep); save(); closeModal(); home();
  };
};
$('#b-account').onclick = () => {
  if (window.NT_account) return window.NT_account();
  modal(`<h2>👤 Fiók</h2><p>A Google-bejelentkezés még nincs beállítva ehhez a tanyához, ezért a haladás csak ezen a gépen, a böngészőben mentődik.</p><button class="nextbtn" data-close>Rendben</button>`);
};

document.querySelectorAll('.cow').forEach(el => el.innerHTML = riska());
home();
