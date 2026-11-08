'use strict';
// Nyelvtanya – J/LY pajta

(function () {
  const W = JLY.map((r, i) => ({ id: i, cat: r[0], w: r[1], bad: r[2], note: r[3] || '' }));
  const byCat = (...cats) => W.filter(x => cats.includes(x.cat)).map(x => x.id);

  // A szó feldarabolása: a j/ly-os helyek külön darabok lesznek
  function tokens(x) {
    const re = x.cat === 'lj' ? /lj/g : /lly|ly|jj|j/g;
    const out = []; let last = 0, m;
    while ((m = re.exec(x.w))) {
      if (m.index > last) out.push({ t: x.w.slice(last, m.index) });
      out.push({ t: m[0], gap: true });
      last = m.index + m[0].length;
    }
    if (last < x.w.length) out.push({ t: x.w.slice(last) });
    return out;
  }
  const PAIR = { j: ['j', 'ly'], ly: ['j', 'ly'], jj: ['jj', 'lly'], lly: ['jj', 'lly'], lj: ['lj', 'ly'] };
  const rag = g => /j$/.test(g) ? g + '-vel' : g + '-nal';

  // Betűkre bontás a kirakóhoz (a kétjegyű betűk egy darabban)
  function letters(w) { return w.match(/dzs|lly|cs|dz|gy|ly|ny|sz|ty|zs|./g); }

  function why(x) {
    const gaps = tokens(x).filter(t => t.gap).map(t => t.t);
    let s = `<b style="font-size:26px">${esc(x.w)}</b> – ` +
      (gaps.length === 1 ? `<b>${rag(gaps[0])}</b> írjuk.` : `így írjuk: ${gaps.map(g => '<b>' + g + '</b>').join(', ')}.`);
    if (x.note.startsWith('b:')) s += `<br>💡 Mert a(z) <b>${esc(x.note.slice(2))}</b> szóból jön, és abban is ly van.`;
    if (x.note.startsWith('lj:')) s += `<br>💡 ${esc(x.note.slice(3))} + ja = ${esc(x.w)}. Kiejtve jj-nek halljuk, de a(z) <b>${esc(x.note.slice(3))}</b> szó l betűje megmarad, és mellé j-s toldalék kerül.`;
    if (x.cat === 'j') s += `<br>💡 Ezt a szót sokan ly-nal írják tévesen, pedig j-vel kell. Jegyezd meg!`;
    if (x.cat === 'nevmas') s += `<br>💡 Az ilyen, olyan, milyen, melyik és társaik mind ly-osak.`;
    return s;
  }

  function wordGapsHTML(tk, filled, cur) {
    let gi = 0;
    return tk.map(t => {
      if (!t.gap) return esc(t.t);
      const i = gi++;
      return `<span class="gap ${i === cur ? 'cur' : ''} ${filled[i] !== undefined ? 'done' : ''}">${filled[i] !== undefined ? esc(filled[i]) : '&nbsp;'}</span>`;
    }).join('');
  }

  const kinds = {
    // 1. Melyik a helyes? – két alak közül
    ketto(x, q) {
      const opts = shuffle([{ html: esc(x.w), ok: true }, { html: esc(x.bad), ok: false }]);
      choice(q, q.tag('🐄 Melyik a helyes?') + `<p class="qtitle">Melyik szót írták le helyesen?</p>`,
        opts, () => why(x), 2, 'jly');
    },
    // 2. Pótold a hiányzó betűt – minden j/ly-os helyre
    potold(x, q) {
      const tk = tokens(x), gaps = tk.filter(t => t.gap), filled = [];
      let cur = 0, ok = true;
      const draw = () => {
        const g = gaps[cur];
        q.card.innerHTML = q.tag('✏️ Pótold!') + `<p class="qtitle">Melyik betű kerül a helyére?</p>
          <div class="big-word">${wordGapsHTML(tk, filled, cur)}</div>
          ${g ? `<div class="opts g2">${PAIR[g.t].map(o => `<button class="opt jly" data-o="${o}">${o}</button>`).join('')}</div>` : ''}`;
        q.card.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const right = b.dataset.o === g.t;
          if (!right) ok = false;
          filled[cur] = b.dataset.o; cur++;
          if (cur < gaps.length) { SND.tap(); draw(); return; }
          draw();
          q.card.querySelector('.big-word').insertAdjacentHTML('afterend', ok ? '' : `<p class="hint">Helyesen: <b>${esc(x.w)}</b></p>`);
          q.done(ok, why(x));
        });
      };
      draw();
    },
    // 3. Záp tojás: négy szóból egy hibás – melyik?
    zap(x, q) {
      const others = sample(W, 3, [x]).map(o => ({ html: '🥚 ' + esc(o.w), ok: false, o }));
      const opts = shuffle(others.concat([{ html: '🥚 ' + esc(x.bad), ok: true, o: x }]));
      choice(q, q.tag('🥚 Záp tojás') + `<p class="qtitle">Riska tojásai közül az egyik záp: rosszul írták rá a szót. Melyik az?</p>`,
        opts, () => `A hibás: <s>${esc(x.bad)}</s> → helyesen ${why(x)}`, 2, 'sm');
    },
    // 4. Válogatás: hat szóból koppintsd meg az összes hibásat
    valogat(x, q) {
      const set = shuffle([x].concat(sample(W, 5, [x])));
      const wrong = new Set(set.filter((o, i) => o === x ? Math.random() < .6 : Math.random() < .35));
      if (!wrong.size) wrong.add(set[1]);
      const sel = new Set();
      q.card.innerHTML = q.tag('🧺 Válogató') + `<p class="qtitle">Koppints az összes <b>hibásan</b> írt szóra, aztán nyomd meg a Kész gombot!</p>
        <div class="opts g3">${set.map((o, i) => `<button class="opt sm" data-i="${i}">${esc(wrong.has(o) ? o.bad : o.w)}</button>`).join('')}</div>
        <button class="nextbtn" id="v-ok">✔ Kész</button>`;
      q.card.querySelectorAll('.opt').forEach(b => b.onclick = () => { SND.tap(); const i = +b.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel'); });
      $('#v-ok').onclick = () => {
        let ok = true;
        q.card.querySelectorAll('.opt').forEach(b => {
          const o = set[+b.dataset.i], isW = wrong.has(o), s = sel.has(+b.dataset.i);
          if (isW !== s) ok = false;
          b.classList.remove('sel'); b.classList.add(isW === s ? 'ok' : 'bad');
          if (isW) b.innerHTML = `<s>${esc(o.bad)}</s><br>${esc(o.w)}`;
        });
        $('#v-ok').remove();
        q.done(ok, `A hibásak helyesen: ${[...wrong].map(o => '<b>' + esc(o.w) + '</b>').join(', ')}.` + (ok ? '' : '<br>A zöld keretesek jók, a pirosakat nézd meg újra!'));
      };
    },
    // 5. Villanókártya + kirakó: megjegyzi, majd kirakja betűkből
    kirako(x, q) {
      const ls = letters(x.w);
      const decoy = x.w.includes('ly') ? ['j'] : ['ly'];
      q.card.innerHTML = q.tag('⚡ Villanókártya') + `<p class="qtitle">Jól nézd meg a szót! Mindjárt eltűnik, és ki kell raknod.</p>
        <div class="flash" id="fl">${esc(x.w)}</div>`;
      speak(x.w);
      setTimeout(() => {
        if (!Q || Q.cur.id !== x.id) return;
        tileBuilder(q, q.tag('🧩 Kirakó') + `<p class="qtitle">Rakd ki a szót a betűkből! ${speakBtn(x.w)}</p>`, ls, x.w, () => why(x), decoy);
      }, 2600);
    }
  };

  registerModule({
    id: 'jly', name: 'J/LY pajta', emoji: '🐔', color: '#16a34a', barnColor: '#dc2626',
    intro: 'Muu! Ebben a pajtában a j és az ly a főszereplő. Kiejtve egyformák, ezért meg kell jegyezni, melyik szóban melyik van. Ha jól válaszolsz, a szó szintet lép, és egyre nehezebb feladatban jön elő.',
    kinds: ['ketto', 'potold', 'zap', 'valogat', 'kirako'],
    pts: { ketto: 10, potold: 12, zap: 14, valogat: 18, kirako: 20 },
    label: id => W[id].w,
    ask: (id, kind, q) => kinds[kind](W[id], q),
    rooms: [
      { id: 'allat', name: 'Állatok', ic: '🐦', cls: 'c1', items: byCat('allat') },
      { id: 'term', name: 'Növények, természet', ic: '🌸', cls: 'c2', items: byCat('noveny', 'termeszet') },
      { id: 'targy', name: 'Tárgyak', ic: '🧺', cls: 'c3', items: byCat('targy') },
      { id: 'hely', name: 'Helyek, emberek', ic: '🏰', cls: 'c4', items: byCat('hely', 'ember') },
      { id: 'elvont', name: 'Szabály, ilyen-olyan', ic: '📜', cls: 'c5', items: byCat('elvont', 'nevmas') },
      { id: 'tul', name: 'Milyen? Mit csinál?', ic: '✨', cls: 'c6', items: byCat('tul', 'ige', 'lj') },
      { id: 'j', name: 'Csalóka j-s szavak', ic: '🧀', cls: 'c2', items: byCat('j') },
      { id: 'mind', name: 'Nagy vegyes', ic: '🎲', cls: 'c1', items: W.map(x => x.id) }
    ],
    album: () => Object.keys(JLY_KAT).map(c => [JLY_KAT[c][1] + ' ' + JLY_KAT[c][0], W.filter(x => x.cat === c).map(x => [x.id, x.w])])
  });
})();
