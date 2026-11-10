'use strict';
// Nyelvtanya – közös játékmotor: mentés, hangok, képernyők, körök, pontozás

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pick = a => a[Math.random() * a.length | 0];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(a, n, not = []) { return shuffle(a.filter(x => !not.includes(x))).slice(0, n); }

// Szintek: 0 = még nem látta, 1–5 = tanulási lépcsők, 6 = mester
const MASTER = 6;
const RANKS = [
  [0, 'Tanyasi csemete', '🌱'], [150, 'Kiscsibe', '🐣'], [400, 'Kecskegida', '🐐'], [800, 'Bárányka', '🐑'],
  [1400, 'Malackirály', '🐷'], [2200, 'Csikós', '🐴'], [3200, 'Tanyagazda', '🧑‍🌾'], [4500, 'Riska barátja', '🐮'],
  [6500, 'Nyelvtanya-mester', '👑']
];
const PRAISE = ['Telitalálat!', 'Ügyes vagy!', 'Pontosan!', 'Nagyszerű!', 'Bravó!', 'Hibátlan!', 'Így kell ezt!'];
const OOPS = ['Majdnem!', 'Semmi baj!', 'Nem egészen...', 'Hoppá!'];

// ---------- Mentés ----------
const KEY = 'nyelvtanya_v1';
function blank() { return { name: '', milk: 0, streak: 0, lastDay: '', sound: true, mods: {}, t: 0 }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.mods) return Object.assign(blank(), s); } catch (e) {} return blank(); }
let S = load();
const SAVE_HOOKS = [];
function save() {
  S.t = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  SAVE_HOOKS.forEach(f => { try { f(S); } catch (e) {} });
}
// Felhőből jött állapot összefésülése: minden szónál a jobb eredmény marad meg
function mergeState(remote) {
  if (!remote || !remote.mods) return false;
  const a = S, b = remote;
  const m = blank();
  m.name = a.name || b.name; m.sound = a.sound;
  m.milk = Math.max(a.milk || 0, b.milk || 0);
  const newer = (a.lastDay || '') >= (b.lastDay || '') ? a : b;
  m.lastDay = newer.lastDay; m.streak = newer.streak;
  for (const src of [b, a]) for (const mod in src.mods) {
    m.mods[mod] = m.mods[mod] || {};
    for (const id in src.mods[mod]) {
      const x = src.mods[mod][id], y = m.mods[mod][id];
      if (!y || x.l > y.l || (x.l === y.l && x.r + x.w > y.r + y.w)) m.mods[mod][id] = Object.assign({}, x);
    }
  }
  const changed = JSON.stringify(m.mods) !== JSON.stringify(a.mods) || m.milk !== a.milk || m.name !== a.name;
  S = m;
  return changed;
}
function P(mod, id) { const m = S.mods[mod] || (S.mods[mod] = {}); return m[id] || (m[id] = { l: 0, r: 0, w: 0, last: -99 }); }
const lvl = (mod, id) => (S.mods[mod] && S.mods[mod][id] ? S.mods[mod][id].l : 0);

function dayStr(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function bumpDay() {
  const t = dayStr(new Date());
  if (S.lastDay === t) return;
  S.streak = S.lastDay === dayStr(new Date(Date.now() - 864e5)) ? S.streak + 1 : 1;
  S.lastDay = t;
}
function liveStreak() { return (S.lastDay === dayStr(new Date()) || S.lastDay === dayStr(new Date(Date.now() - 864e5))) ? S.streak : 0; }
function rankOf(x) { let i = 0; while (i + 1 < RANKS.length && x >= RANKS[i + 1][0]) i++; return i; }

// ---------- Riska, a kabala: szemből rajzolt, kicsit kockafejű tehén ----------
function riska() {
  return `<svg viewBox="0 0 120 120" class="riska" role="img" aria-label="Riska, a tehén">
    <path d="M30 26 C20 22 16 12 20 4 C26 12 32 14 38 18 Z" fill="#fde68a" stroke="#78350f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M90 26 C100 22 104 12 100 4 C94 12 88 14 82 18 Z" fill="#fde68a" stroke="#78350f" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="17" cy="42" rx="15" ry="8" transform="rotate(-18 17 42)" fill="#fff" stroke="#1f2937" stroke-width="3"/>
    <ellipse cx="18" cy="42" rx="8" ry="4" transform="rotate(-18 18 42)" fill="#f9a8d4"/>
    <ellipse cx="103" cy="42" rx="15" ry="8" transform="rotate(18 103 42)" fill="#fff" stroke="#1f2937" stroke-width="3"/>
    <ellipse cx="102" cy="42" rx="8" ry="4" transform="rotate(18 102 42)" fill="#f9a8d4"/>
    <clipPath id="riska-fej"><rect x="27" y="16" width="66" height="70" rx="16"/></clipPath>
    <rect x="27" y="16" width="66" height="70" rx="16" fill="#fff"/>
    <g clip-path="url(#riska-fej)" fill="#1f2937">
      <path d="M27 16 H56 C58 26 50 34 40 36 C32 38 28 46 27 52 Z"/>
      <path d="M93 54 C84 52 78 60 82 70 C85 78 93 78 93 78 Z"/>
    </g>
    <rect x="27" y="16" width="66" height="70" rx="16" fill="none" stroke="#1f2937" stroke-width="3"/>
    <path d="M52 17 C55 10 60 12 60 17 C61 11 67 11 68 17" fill="#fff" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="46" cy="46" r="9" fill="#fff" stroke="#1f2937" stroke-width="2.5"/>
    <circle cx="74" cy="46" r="9" fill="#fff" stroke="#1f2937" stroke-width="2.5"/>
    <circle cx="47.5" cy="47.5" r="5" fill="#1f2937"/><circle cx="75.5" cy="47.5" r="5" fill="#1f2937"/>
    <circle cx="49" cy="45.5" r="1.8" fill="#fff"/><circle cx="77" cy="45.5" r="1.8" fill="#fff"/>
    <rect x="22" y="64" width="76" height="40" rx="18" fill="#fbcfe8" stroke="#1f2937" stroke-width="3"/>
    <ellipse cx="45" cy="78" rx="5" ry="7" fill="#be185d"/><ellipse cx="75" cy="78" rx="5" ry="7" fill="#be185d"/>
    <path d="M50 93 Q60 99 70 93" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="112" r="7" fill="#f59e0b" stroke="#92400e" stroke-width="2.5"/><circle cx="60" cy="114" r="2" fill="#92400e"/>
  </svg>`;
}

// ---------- Hang és felolvasás ----------
let AC;
function tone(freqs, dur = .12, type = 'sine', gap = .1, vol = .15) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * gap;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01);
      g.gain.exponentialRampToValueAtTime(.001, t + dur + .15);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .2);
    });
  } catch (e) {}
}
const SND = {
  ok: () => tone([660, 880], .12), bad: () => tone([300, 220], .18, 'triangle', .15, .12),
  tap: () => tone([520], .05, 'sine', 0, .06), win: () => tone([523, 659, 784, 1047], .15, 'sine', .12)
};
let HUV = null;
function initVoice() { try { HUV = speechSynthesis.getVoices().find(v => /^hu/i.test(v.lang)) || null; } catch (e) {} }
if ('speechSynthesis' in window) { initVoice(); speechSynthesis.onvoiceschanged = initVoice; }
function speak(t) {
  if (!HUV || !S.sound) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.voice = HUV; u.lang = HUV.lang; u.rate = .85; speechSynthesis.speak(u);
}
function speakBtn(text) { return HUV ? `<button class="iconbtn" data-say="${esc(text)}" title="Felolvasás">🔊</button>` : ''; }
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) speak(b.dataset.say); });

// ---------- Konfetti ----------
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], anim = false;
function confetti(n = 60) {
  if (!anim) { cv.width = innerWidth; cv.height = innerHeight; }
  const cols = ['#f59e0b', '#dc2626', '#16a34a', '#2563eb', '#9333ea', '#ffffff'];
  for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 4, r: Math.random() * 360, s: 7 + Math.random() * 8, c: cols[i % 6], life: 80 + Math.random() * 50 });
  if (!anim) { anim = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life-- > 0);
  for (const p of parts) {
    p.vy += .45; p.x += p.vx; p.y += p.vy; p.r += 8;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r * Math.PI / 180); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore();
  }
  if (parts.length) requestAnimationFrame(tick); else { anim = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
function floatPts(n, el) {
  const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
  const d = document.createElement('div'); d.className = 'floatpts'; d.textContent = '+' + n + ' 🥛';
  d.style.left = (r.left + r.width / 2 - 40) + 'px'; d.style.top = (r.top - 10) + 'px';
  document.body.appendChild(d); setTimeout(() => d.remove(), 1000);
}

// ---------- Képernyők ----------
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id)); scrollTo(0, 0); }
function modal(html) { $('#modalcard').innerHTML = html; $('#modal').classList.add('on'); }
function closeModal() { $('#modal').classList.remove('on'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });

// ---------- Pajták (modulok) ----------
// Egy modul: { id, name, emoji, color, intro, rooms: [{ id, name, ic, cls, sub, items: [elemazonosítók] }],
//   label(id) → a szó, ahogy a listákban megjelenik,
//   ask(id, kind, q) → kirajzolja a kérdést a q.card-ba, és q.done(jó?, magyarázatHTML)-lel zárja,
//   kinds: [szintenkénti feladattípusok 1-től 5-ig], pts: { feladattípus: pont } }
const MODULES = [];
function registerModule(m) { MODULES.push(m); }
const modById = id => MODULES.find(m => m.id === id);

function roomStats(mod, room) {
  const ls = room.items.map(id => lvl(mod.id, id));
  const master = ls.filter(l => l >= MASTER).length, seen = ls.filter(l => l > 0).length;
  const pct = room.items.length ? ls.reduce((a, l) => a + l, 0) / (room.items.length * MASTER) : 0;
  return { master, seen, total: room.items.length, pct, stars: pct >= .95 ? 3 : pct >= .6 ? 2 : pct >= .25 ? 1 : 0 };
}
function modStats(mod) {
  const all = [...new Set(mod.rooms.flatMap(r => r.items))];
  return roomStats(mod, { items: all });
}

// ---------- Egy kör ----------
const ROUND = 10;
let Q = null;

function buildRound(mod, room) {
  const now = S.round = (S.round || 0) + 1;
  const ids = room.items;
  const st = id => S.mods[mod.id] && S.mods[mod.id][id];
  const wrongish = ids.filter(id => { const p = st(id); return p && p.l > 0 && p.l < MASTER && p.w > 0 && p.last < now - 1; });
  const learning = ids.filter(id => { const p = st(id); return p && p.l > 0 && p.l < MASTER; });
  const fresh = ids.filter(id => !st(id) || st(id).l === 0);
  const master = ids.filter(id => { const p = st(id); return p && p.l >= MASTER; });
  let pickd = [];
  const add = (arr, n) => { for (const id of shuffle(arr)) { if (pickd.length >= ROUND || n <= 0) break; if (!pickd.includes(id)) { pickd.push(id); n--; } } };
  add(wrongish, 3); add(fresh, 4); add(learning, ROUND); add(master, 2); add(fresh, ROUND); add(master, ROUND);
  return shuffle(pickd);
}

function startRound(modId, roomId) {
  const mod = modById(modId), room = mod.rooms.find(r => r.id === roomId);
  Q = { mod, room, list: buildRound(mod, room), i: 0, score: 0, combo: 0, good: 0, missed: [], retry: [] };
  bumpDay(); save();
  show('s-quiz'); nextQ();
}

// A modul saját választója (pickKind) szintenként több feladattípus közül sorsolhat, hogy ne legyen egyhangú
function kindFor(mod, id) {
  const l = Math.max(1, Math.min(5, lvl(mod.id, id) || 1));
  return mod.pickKind ? pick(mod.pickKind[l - 1]) : mod.kinds[l - 1];
}

function nextQ() {
  if (Q.i >= Q.list.length) return endRound();
  $('#q-prog').style.width = (Q.i / Q.list.length * 100) + '%';
  $('#q-score').textContent = Q.score;
  const id = Q.list[Q.i];
  let kind = kindFor(Q.mod, id);
  if (lvl(Q.mod.id, id) >= MASTER) kind = pick(Q.mod.kinds);
  const card = $('#q-card');
  card.innerHTML = '';
  Q.cur = { id, kind, answered: false };
  Q.mod.ask(id, kind, {
    card,
    done: (ok, why) => answer(ok, why),
    tag: (txt, color) => `<span class="tag" style="background:${color || Q.mod.color}">${txt}</span>`
  });
}

function answer(ok, why) {
  if (Q.cur.answered) return; Q.cur.answered = true;
  const { id, kind } = Q.cur, mod = Q.mod, p = P(mod.id, id);
  p.last = S.round;
  let html;
  if (ok) {
    p.r++; p.l = Math.min(MASTER, p.l + 1);
    Q.combo++; Q.good++;
    const mult = Q.combo >= 5 ? 3 : Q.combo >= 3 ? 2 : 1;
    const pts = (mod.pts[kind] || 10) * mult;
    Q.score += pts; S.milk += pts;
    $('#q-score').textContent = Q.score;
    SND.ok(); floatPts(pts, $('#q-score'));
    if (Q.combo === 3 || Q.combo === 5 || Q.combo === 8) { $('#q-combo').textContent = '×' + mult + ' 🔥'; $('#q-combo').classList.remove('pop'); void $('#q-combo').offsetWidth; $('#q-combo').classList.add('pop'); }
    html = `<h3>✅ ${pick(PRAISE)}</h3>`;
  } else {
    p.w++; p.l = Math.max(1, p.l - 1);
    Q.combo = 0; $('#q-combo').textContent = '';
    SND.bad();
    if (!Q.missed.includes(id)) Q.missed.push(id);
    // a rontott elem a kör végén még egyszer előjön
    if (!Q.retry.includes(id)) { Q.retry.push(id); Q.list.push(id); }
    html = `<h3>❌ ${pick(OOPS)}</h3>`;
  }
  if (why) html += `<div class="why">${why}</div>`;
  save();
  const fb = document.createElement('div');
  fb.className = 'feedback on ' + (ok ? 'ok' : 'bad');
  fb.innerHTML = html + `<button class="nextbtn${ok ? '' : ' y'}" id="q-next">${Q.i + 1 >= Q.list.length ? 'Eredmény 🏁' : 'Tovább ➜'}</button>`;
  $('#q-card').appendChild(fb);
  $('#q-card').querySelectorAll('button:not(#q-next):not([data-say])').forEach(b => b.disabled = true);
  $('#q-next').onclick = () => { Q.i++; nextQ(); };
  setTimeout(() => fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

function endRound() {
  $('#q-prog').style.width = '100%';
  const n = Q.list.length, first = n - Q.retry.length;
  const ratio = first ? (Q.good - (Q.good > first ? Q.good - first : 0)) / first : 0;
  const goodFirst = first - Q.missed.length;
  const stars = goodFirst >= first ? 3 : goodFirst >= first * .7 ? 2 : goodFirst >= first * .4 ? 1 : 0;
  $('#r-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('#r-title').textContent = stars === 3 ? 'Hibátlan kör! 🎉' : stars === 2 ? 'Nagyon ügyes voltál!' : stars === 1 ? 'Szép munka, gyakoroljunk még!' : 'Semmi baj, így tanulunk!';
  $('#r-text').textContent = `${goodFirst} / ${first} elsőre jó · +${Q.score} tejesüveg 🥛`;
  $('#r-list').innerHTML = Q.missed.length
    ? `<p class="hint" style="margin-top:4px">Ezeket érdemes még gyakorolni:</p><p style="font-size:22px;font-weight:800">${Q.missed.map(id => esc(Q.mod.label(id))).join(' · ')}</p>`
    : '';
  if (stars >= 2) { confetti(stars === 3 ? 120 : 60); SND.win(); }
  show('s-result');
  void ratio;
}
$('#r-again').onclick = () => startRound(Q.mod.id, Q.room.id);
$('#r-home').onclick = () => openBarn(Q.mod.id);
$('#q-quit').onclick = () => { if (confirm('Biztosan kilépsz ebből a körből?')) openBarn(Q.mod.id); };

// ---------- Közös kérdéssablon: választós feladat ----------
// opts: [{ html, ok }], why(okClicked) → magyarázat
function choice(q, head, opts, why, cols = 2, cls = '') {
  q.card.innerHTML = head + `<div class="opts g${cols}">${opts.map((o, i) => `<button class="opt ${cls}" data-i="${i}">${o.html}</button>`).join('')}</div>`;
  q.card.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const o = opts[+b.dataset.i];
    q.card.querySelectorAll('.opt').forEach((x, i) => { if (opts[i].ok) x.classList.add('ok'); else if (x !== b) x.classList.add('dim'); });
    if (!o.ok) b.classList.add('bad');
    q.done(o.ok, why(o.ok));
  });
}

// Betűkirakó: a darabokból kell összerakni a választ
function tileBuilder(q, head, pieces, answer, why, extra = []) {
  const all = shuffle(pieces.concat(extra));
  q.card.innerHTML = head + `<div class="slots" id="slots"></div><div class="tiles" id="tiles">${all.map((p, i) => `<button class="tile" data-i="${i}">${esc(p)}</button>`).join('')}</div>
    <div class="opts g2"><button class="opt sm" id="t-undo">⌫ Visszavon</button><button class="opt sm" id="t-ok" style="border-color:var(--pri)">✔ Kész</button></div>`;
  const used = [];
  const draw = () => {
    $('#slots').innerHTML = used.map(i => `<span class="tile" style="display:inline-flex;align-items:center">${esc(all[i])}</span>`).join('');
    q.card.querySelectorAll('#tiles .tile').forEach(b => b.classList.toggle('used', used.includes(+b.dataset.i)));
  };
  q.card.querySelectorAll('#tiles .tile').forEach(b => b.onclick = () => { SND.tap(); used.push(+b.dataset.i); draw(); });
  $('#t-undo').onclick = () => { used.pop(); draw(); };
  $('#t-ok').onclick = () => {
    if (!used.length) return;
    const got = used.map(i => all[i]).join('');
    const ok = got === answer;
    if (!ok) $('#slots').innerHTML += `<div style="width:100%;text-align:center;font-size:22px;font-weight:800;color:var(--bad)">Te ezt raktad ki: ${esc(got)}</div>`;
    q.done(ok, why(ok));
  };
}
