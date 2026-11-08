'use strict';
// Nyelvtanya – Ragozó pajta, 1. rész: igeragozás (alanyi ragozás)

(function () {
  const SZ = ['én', 'te', 'ő', 'mi', 'ti', 'ők'];
  const IDO = { jelen: 'jelen idő', mult: 'múlt idő', felt: 'feltételes mód', felsz: 'felszólító mód' };
  const IDO_BA = { jelen: 'jelen időbe', mult: 'múlt időbe', felt: 'feltételes módba', felsz: 'felszólító módba' };
  const IDO_IC = { jelen: '⏺️', mult: '⏪', felt: '💭', felsz: '❗' };
  const KERDES = { jelen: 'Most mit csinál?', mult: 'Mit csinált?', felt: 'Mit csinálna?', felsz: 'Mit csináljon?' };
  const RENDHAGYO = ['megy', 'jön', 'van', 'eszik', 'iszik', 'tesz', 'vesz', 'visz', 'lesz', 'hisz', 'alszik'];

  // IGE: { ige: { idő: [6 cella, mindegyik az elfogadott alakok listája] } }
  // A *-gal jelölt alakot (régies) elfogadjuk, de soha nem mutatjuk.
  const clean = f => f.replace(/\*$/, '');
  const shown = cell => cell.find(f => !f.endsWith('*')) || clean(cell[0]);
  const VERBS = Object.keys(IGE).filter(v => Object.keys(IDO).every(t => IGE[v][t] && IGE[v][t].length === 6));
  const ITEMS = [];
  for (const v of VERBS) for (const t in IDO) ITEMS.push({ id: v + '|' + t, v, t });
  const byId = Object.fromEntries(ITEMS.map(x => [x.id, x]));
  const accepts = (v, t, p) => IGE[v][t][p].map(clean);
  const allForms = v => Object.keys(IDO).flatMap(t => IGE[v][t].map((c, p) => ({ t, p, f: shown(c) })));

  function table(v, t, hlP) {
    return `<table class="list">${IGE[v][t].map((c, p) => `<tr${p === hlP ? ' style="background:#fef3c7;font-weight:900"' : ''}><td style="width:60px">${SZ[p]}</td><td>${c.filter(f => !f.endsWith('*')).map(esc).join(' / ')}</td></tr>`).join('')}</table>`;
  }
  const why = (x, p) => `<b>${esc(x.v)}</b>, ${IDO[x.t]}:${table(x.v, x.t, p)}`;

  // Négy választási lehetőség: a jó alak + ugyanannak az igének más alakjai (soha nem egy másik elfogadott alak)
  function formOpts(v, t, p) {
    const ok = shown(IGE[v][t][p]), acc = accepts(v, t, p);
    const near = allForms(v).filter(o => !acc.includes(o.f) && (o.t === t || o.p === p)).map(o => o.f);
    const far = allForms(v).map(o => o.f).filter(f => !acc.includes(f));
    const wrong = [...new Set(shuffle(near).concat(shuffle(far)))].slice(0, 3);
    return shuffle([{ html: esc(ok), ok: true }].concat(wrong.map(f => ({ html: esc(f), ok: false }))));
  }

  const kinds = {
    // 1. Ki csinálja? – a ragból kitalálni a személyt
    ki(x, q) {
      const p = Math.random() * 6 | 0, f = shown(IGE[x.v][x.t][p]);
      const good = SZ.map((s, i) => accepts(x.v, x.t, i).includes(f));
      choice(q, q.tag('👤 Ki csinálja?') + `<p class="qtitle">${IDO_IC[x.t]} ${IDO[x.t]} · Ki az, aki…</p><div class="big-word">${esc(f)}</div>`,
        SZ.map((s, i) => ({ html: s, ok: good[i] })), () => why(x, p), 3);
    },
    // 2. Melyik idő vagy mód?
    ido(x, q) {
      const p = Math.random() * 6 | 0, f = shown(IGE[x.v][x.t][p]);
      const good = Object.keys(IDO).map(t => IGE[x.v][t].some(c => c.map(clean).includes(f)));
      choice(q, q.tag('⏰ Melyik idő?') + `<p class="qtitle">Milyen időben vagy módban van ez az ige?</p><div class="big-word">${esc(f)}</div>`,
        Object.keys(IDO).map((t, i) => ({ html: IDO_IC[t] + ' ' + IDO[t], ok: good[i] })), () => why(x, p), 2, 'sm');
    },
    // 3. Ragozd! – személy + idő alapján a jó alak
    ragozd(x, q) {
      const p = Math.random() * 6 | 0;
      choice(q, q.tag('🔧 Ragozd!') + `<p class="qtitle">${IDO_IC[x.t]} ${IDO[x.t]} · ${KERDES[x.t]}</p>
        <div class="big-word"><span style="color:var(--soft)">${SZ[p]}</span> + ${esc(x.v)}</div>`,
        formOpts(x.v, x.t, p), () => why(x, p), 2);
    },
    // 4. Időgép: ugyanaz a személy, másik idő
    idogep(x, q) {
      const p = Math.random() * 6 | 0, from = pick(Object.keys(IDO).filter(t => t !== x.t));
      const f = shown(IGE[x.v][from][p]);
      choice(q, q.tag('🚀 Időgép') + `<p class="qtitle">Tedd át ${IDO_IC[x.t]} <b>${IDO_BA[x.t]}</b>! A személy marad (${SZ[p]}).</p>
        <div class="big-word">${esc(f)} <span style="font-size:24px;color:var(--soft)">(${IDO[from]})</span></div>`,
        formOpts(x.v, x.t, p), () => why(x, p), 2);
    },
    // 5. Kirakó: betűkből rakja össze a ragozott alakot
    kirako(x, q) {
      const p = Math.random() * 6 | 0, f = shown(IGE[x.v][x.t][p]);
      const ls = f.match(/dzs|cs|dz|gy|ly|ny|sz|ty|zs|./g);
      const other = shuffle(allForms(x.v).map(o => o.f).join('').match(/dzs|cs|dz|gy|ly|ny|sz|ty|zs|./g)).slice(0, 2);
      tileBuilder(q, q.tag('🧩 Kirakó') + `<p class="qtitle">${IDO_IC[x.t]} ${IDO[x.t]} · Rakd ki: <b>${SZ[p]}</b> + <b>${esc(x.v)}</b></p>`,
        ls, f, () => why(x, p), other);
    }
  };

  const room = (id, name, ic, cls, f) => ({ id, name, ic, cls, items: ITEMS.filter(f).map(x => x.id) });
  registerModule({
    id: 'ige', name: 'Igeragozó', emoji: '🐴', color: '#ea580c',
    intro: 'Itt az igéket ragozzuk: ki csinálja, és mikor? Én olvasok, te olvastál, ő olvasna… Minden feladat után megmutatom a teljes ragozást.',
    kinds: ['ki', 'ido', 'ragozd', 'idogep', 'kirako'],
    pts: { ki: 10, ido: 10, ragozd: 14, idogep: 18, kirako: 20 },
    label: id => byId[id].v + ' (' + IDO[byId[id].t] + ')',
    ask: (id, kind, q) => kinds[kind](byId[id], q),
    rooms: [
      room('jelen', 'Jelen idő', '⏺️', 'c1', x => x.t === 'jelen' && !RENDHAGYO.includes(x.v)),
      room('mult', 'Múlt idő', '⏪', 'c4', x => x.t === 'mult' && !RENDHAGYO.includes(x.v)),
      room('felt', 'Feltételes mód', '💭', 'c3', x => x.t === 'felt' && !RENDHAGYO.includes(x.v)),
      room('felsz', 'Felszólító mód', '❗', 'c6', x => x.t === 'felsz' && !RENDHAGYO.includes(x.v)),
      room('rendhagyo', 'Rendhagyó igék', '🌀', 'c2', x => RENDHAGYO.includes(x.v)),
      room('mind', 'Nagy vegyes', '🎲', 'c5', () => true)
    ],
    album: () => VERBS.map(v => [v, Object.keys(IDO).map(t => [v + '|' + t, IDO[t] + ': ' + IGE[v][t].map(shown).join(', ')])])
  });
})();
