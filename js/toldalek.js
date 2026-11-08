'use strict';
// Nyelvtanya – Ragozó pajta, 2. rész: szóelemek (tő, képző, jel, rag)

(function () {
  const TIP = { t: 'tő', k: 'képző', j: 'jel', r: 'rag' };
  const TIP_IC = { k: '🔵', j: '🟣', r: '🟠', t: '🟢' };
  const W = TOLDALEK.map((s, i) => {
    const segs = s.split('|').map(x => { const [txt, tip, sz] = x.split(':'); return { txt, tip: tip || 't', sz: sz || '' }; });
    const toi = segs.findIndex(g => g.tip === 't');
    segs.forEach((g, k) => { g.pre = k < toi; });
    return { id: i, segs, w: segs.map(g => g.txt).join(''), to: segs[toi].txt };
  });
  const suf = x => x.segs.filter(g => g.tip !== 't');
  const dash = g => g.pre ? g.txt + '-' : '-' + g.txt;

  function colored(x, hl) {
    return `<div class="morph">${x.segs.map(g => `<span class="seg ${hl === undefined ? 't-' + g.tip : g === hl ? 'hl' : ''}">${esc(g.txt)}</span>`).join('')}</div>`;
  }
  function why(x) {
    return colored(x) + suf(x).map(g => `${TIP_IC[g.tip]} <b>${esc(dash(g))}</b>: ${TIP[g.tip]}, ${SZEREP[g.sz]}`).join('<br>') +
      `<br>${TIP_IC.t} A szó töve: <b>${esc(x.to)}</b>`;
  }
  const legend = `<div class="legend">${['t', 'k', 'j', 'r'].map(t => `<span class="seg t-${t}" style="font-size:16px;padding:4px 12px">${TIP[t]}</span>`).join('')}</div>`;

  const kinds = {
    // 1. Mi ez a toldalék? – képző, jel vagy rag
    tipus(x, q) {
      const g = pick(suf(x));
      choice(q, q.tag('🔍 Mi ez a toldalék?') + `<p class="qtitle">A kiemelt rész (<b>${esc(dash(g))}</b>) képző, jel vagy rag?</p>` + colored(x, g),
        ['k', 'j', 'r'].map(t => ({ html: TIP_IC[t] + ' ' + TIP[t], ok: t === g.tip })), () => why(x), 3);
    },
    // 2. Mi a szó töve?
    to(x, q) {
      const cands = new Set([x.to]);
      let acc = '';
      x.segs.forEach(g => { acc += g.txt; if (acc !== x.to) cands.add(acc); });
      cands.add(x.w);
      for (const o of shuffle(W)) { if (cands.size >= 4) break; cands.add(o.to); }
      const opts = shuffle([...cands].slice(0, 4)).map(c => ({ html: esc(c), ok: c === x.to }));
      choice(q, q.tag('🌱 Hol a tő?') + `<p class="qtitle">Mi a szó töve? (A tő a szó alapja, a toldalékok nélkül.)</p><div class="big-word">${esc(x.w)}</div>`,
        opts, () => why(x), 2);
    },
    // 3. Mit jelent a toldalék?
    szerep(x, q) {
      const g = pick(suf(x));
      const others = sample(Object.keys(SZEREP).filter(k => SZEREP[k] !== SZEREP[g.sz]), 3);
      const opts = shuffle([g.sz].concat(others)).map(k => ({ html: SZEREP[k], ok: k === g.sz }));
      choice(q, q.tag('💬 Mit jelent?') + `<p class="qtitle">Mit fejez ki a kiemelt <b>${esc(dash(g))}</b>?</p>` + colored(x, g),
        opts, () => why(x), 1, 'sm');
    },
    // 4. Vágd szét! – a szóelemek határainak megkeresése
    vag(x, q) {
      const ls = [...x.w], cuts = new Set();
      let pos = 0;
      x.segs.slice(0, -1).forEach(g => { pos += [...g.txt].length; cuts.add(pos); });
      const on = new Set();
      q.card.innerHTML = q.tag('✂️ Vágd szét!') + `<p class="qtitle">Koppints oda, ahol az egyik szóelem véget ér, és a következő kezdődik!</p>
        <div class="letters">${ls.map((c, i) => (i ? `<button class="cut" data-i="${i}"></button>` : '') + `<span>${esc(c)}</span>`).join('')}</div>
        <button class="nextbtn" id="c-ok">✔ Kész</button>`;
      q.card.querySelectorAll('.cut').forEach(b => b.onclick = () => { SND.tap(); const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); b.classList.toggle('on'); });
      $('#c-ok').onclick = () => {
        const ok = cuts.size === on.size && [...cuts].every(i => on.has(i));
        q.card.querySelectorAll('.cut').forEach(b => { const i = +b.dataset.i; if (cuts.has(i) && !on.has(i)) b.classList.add('miss', 'on'); if (!cuts.has(i) && on.has(i)) b.classList.remove('on'); });
        $('#c-ok').remove();
        q.done(ok, why(x));
      };
    },
    // 5. Színezd ki! – minden szóelemhez a típusa
    szinez(x, q) {
      const order = ['t', 'k', 'j', 'r'], got = x.segs.map(() => -1);
      q.card.innerHTML = q.tag('🎨 Színezd ki!') + `<p class="qtitle">Koppints a szóelemekre, amíg a jó színt nem kapják!</p>${legend}
        <div class="morph">${x.segs.map((g, i) => `<button class="seg" data-i="${i}">${esc(g.txt)}</button>`).join('')}</div>
        <button class="nextbtn" id="s-ok">✔ Kész</button>`;
      q.card.querySelectorAll('.morph .seg').forEach(b => b.onclick = () => {
        SND.tap(); const i = +b.dataset.i; got[i] = (got[i] + 1) % 4;
        b.className = 'seg t-' + order[got[i]];
      });
      $('#s-ok').onclick = () => {
        if (got.includes(-1)) { $('#s-ok').textContent = 'Még minden elemet színezz ki! 🎨'; return; }
        const ok = x.segs.every((g, i) => order[got[i]] === g.tip);
        $('#s-ok').remove();
        q.done(ok, why(x));
      };
    }
  };

  const has = t => W.filter(x => x.segs.some(g => g.tip === t)).map(x => x.id);
  registerModule({
    id: 'toldalek', name: 'Toldalékoló', emoji: '🐷', color: '#9333ea',
    intro: 'A szavak darabokból állnak, mint egy kerítés. Elöl a tő, utána jönnek a toldalékok: a képző új szót csinál, a jel kicsit módosít rajta, a rag pedig a mondatba illeszti, és mindig a végén áll.',
    kinds: ['tipus', 'to', 'szerep', 'vag', 'szinez'],
    pts: { tipus: 10, to: 12, szerep: 14, vag: 18, szinez: 20 },
    label: id => W[id].w,
    ask: (id, kind, q) => kinds[kind](W[id], q),
    rooms: [
      { id: 'k', name: 'Képzők', ic: '🔵', cls: 'c4', items: has('k') },
      { id: 'j', name: 'Jelek', ic: '🟣', cls: 'c3', items: has('j') },
      { id: 'r', name: 'Ragok', ic: '🟠', cls: 'c2', items: has('r') },
      { id: 'tobb', name: 'Hosszú szavak', ic: '🚂', cls: 'c1', items: W.filter(x => suf(x).length > 1).map(x => x.id) },
      { id: 'mind', name: 'Nagy vegyes', ic: '🎲', cls: 'c5', items: W.map(x => x.id) }
    ],
    album: () => [['Szóelemek', W.map(x => [x.id, x.segs.map(g => g.txt).join(' + ')])]]
  });
})();
