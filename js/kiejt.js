'use strict';
// Nyelvtanya – Kiejtés-csapda pajta: másképp halljuk, mint ahogy írjuk (szóelemző írásmód)

(function () {
  const W = KIEJT.map((r, i) => {
    const [to, told] = r[2].split('|');
    // az „ossze” kategóriában a kiejtés megegyezik az írással, a tárolt alak ott a hibás írás
    return { id: i, cat: r[0], w: r[1], to, told, pron: r[0] === 'ossze' ? r[1] : r[3], bad: [r[3]].concat(r[4]) };
  });
  const byCat = (...cats) => W.filter(x => cats.includes(x.cat)).map(x => x.id);
  const letters = w => w.match(/dzs|cs|dz|gy|ly|ny|sz|ty|zs|./g);
  const pron = x => `<span class="pron">[${esc(x.pron)}]</span>`;
  const parts = x => `<div class="morph" style="font-size:34px;margin:6px 0"><span class="seg t-t">${esc(x.to)}</span><span class="seg t-r">${esc(x.told)}</span></div>`;

  function why(x) {
    let s = parts(x) + `<b style="font-size:26px">${esc(x.w)}</b> = ${esc(x.to)} + ${esc(x.told)}<br>`;
    if (x.cat === 'ossze') {
      const v = x.to.match(/(sz|s|z)$/)[1];
      s += `💡 Vigyázz, ez kivétel! Az <b>s, sz, z</b> végű szavaknál a j írásban is átalakul: <b>${v} + j → ${v === 'sz' ? 'ssz' : v + v}</b>. Ezért nem <s>${esc(x.bad[0])}</s>, hanem <b>${esc(x.w)}</b>.`;
    } else if (x.cat === 'dt') {
      s += `💡 Kiejtve ${pron(x)}, a d szinte eltűnik. Írásban mégis ott marad, mert a szó töve: <b>${esc(x.to)}</b>.`;
    } else if (/^s/.test(x.told)) {
      s += `💡 Kiejtve ${pron(x)}: a t és az s együtt cs-nek hangzik. Írásban mindkettő megmarad, mert a szó töve: <b>${esc(x.to)}</b>.`;
    } else {
      s += `💡 Kiejtve ${pron(x)}, mert a j összeolvad az előtte álló hanggal. Írásban mindkettő megmarad: így látszik, hogy a szó töve <b>${esc(x.to)}</b>, a toldalék pedig <b>-${esc(x.told)}</b>.`;
    }
    return s;
  }

  const kinds = {
    // 1. Melyik a helyes? – a jó írás és a kiejtés szerinti
    ketto(x, q) {
      const opts = shuffle([{ html: esc(x.w), ok: true }, { html: esc(x.bad[0]), ok: false }]);
      choice(q, q.tag('✅ Melyik a helyes?') + `<p class="qtitle">Melyik szót írták le helyesen? ${speakBtn(x.w)}</p>`, opts, () => why(x), 2);
    },
    // 2. Mi lesz belőle? – tő + toldalék összerakva, több alak közül
    ossze(x, q) {
      const opts = shuffle([{ html: esc(x.w), ok: true }].concat([...new Set(x.bad)].map(b => ({ html: esc(b), ok: false }))));
      choice(q, q.tag('🔗 Mi lesz belőle?') + `<p class="qtitle">Hogyan írjuk le, ha összerakjuk?</p>
        <div class="big-word">${esc(x.to)} <span style="color:var(--soft)">+</span> ${esc(x.told)}</div>`, opts, () => why(x), opts.length);
    },
    // 3. Záp tojás: négy szóból egy hibás
    zap(x, q) {
      const others = sample(W, 3, [x]).map(o => ({ html: '🥚 ' + esc(o.w), ok: false }));
      const opts = shuffle(others.concat([{ html: '🥚 ' + esc(x.bad[0]), ok: true }]));
      choice(q, q.tag('🥚 Záp tojás') + `<p class="qtitle">Az egyik tojásra úgy írták a szót, ahogy hallották, nem ahogy helyes. Melyik az?</p>`,
        opts, () => `A hibás: <s>${esc(x.bad[0])}</s><br>` + why(x), 2, 'sm');
    },
    // 4. Válogató: hat szóból az összes hibás
    valogat(x, q) {
      const set = shuffle([x].concat(sample(W, 5, [x])));
      const wrong = new Set(set.filter(o => o === x ? Math.random() < .6 : Math.random() < .35));
      if (!wrong.size) wrong.add(set[1]);
      const sel = new Set();
      q.card.innerHTML = q.tag('🧺 Válogató') + `<p class="qtitle">Koppints az összes <b>hibásan</b> írt szóra, aztán nyomd meg a Kész gombot!</p>
        <div class="opts g3">${set.map((o, i) => `<button class="opt sm" data-i="${i}">${esc(wrong.has(o) ? o.bad[0] : o.w)}</button>`).join('')}</div>
        <button class="nextbtn" id="v-ok">✔ Kész</button>`;
      q.card.querySelectorAll('.opt').forEach(b => b.onclick = () => { SND.tap(); const i = +b.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel'); });
      $('#v-ok').onclick = () => {
        let ok = true;
        q.card.querySelectorAll('.opt').forEach(b => {
          const o = set[+b.dataset.i], isW = wrong.has(o), s = sel.has(+b.dataset.i);
          if (isW !== s) ok = false;
          b.classList.remove('sel'); b.classList.add(isW === s ? 'ok' : 'bad');
          if (isW) b.innerHTML = `<s>${esc(o.bad[0])}</s><br>${esc(o.w)}`;
        });
        $('#v-ok').remove();
        q.done(ok, `A hibásak helyesen: ${[...wrong].map(o => '<b>' + esc(o.w) + '</b>').join(', ')}.<br>` + why(x));
      };
    },
    // 5. Javítsd ki! – a kiejtés szerint leírt szót betűkből kell helyesen kirakni
    kirako(x, q) {
      const ls = letters(x.w);
      const decoy = [...new Set(x.bad.flatMap(letters))].filter(l => !ls.includes(l)).slice(0, 3);
      if (!decoy.length) decoy.push(x.cat === 'ossze' ? 'j' : x.cat === 'dt' ? 't' : 'gy');
      tileBuilder(q, q.tag('🧩 Javítsd ki!') + `<p class="qtitle">Valaki úgy írta le, ahogy hallotta: <b style="color:var(--bad)"><s>${esc(x.bad[0])}</s></b><br>Rakd ki helyesen a betűkből! ${speakBtn(x.w)}</p>
        <p class="hint">Segítség: ${esc(x.to)} + ${esc(x.told)}</p>`, ls, x.w, () => why(x), decoy);
    }
  };

  registerModule({
    id: 'kiejt', name: 'Kiejtés-csapda', emoji: '🦆', color: '#0d9488',
    intro: 'Ebben a pajtában a szavak mást mondanak, mint amit leírunk! Szaladjon: kiejtve szalaggyon, de írásban megmarad a d és a j is, mert a szó töve szalad. Ha tudod, miből jön a szó, nem esel a csapdába.',
    kinds: ['ketto', 'ossze', 'zap', 'valogat', 'kirako'],
    // szintenként ezek közül sorsol; a kirakás minden szinten előjön
    pickKind: [['ketto', 'ossze', 'kirako'], ['ossze', 'kirako', 'ketto'], ['zap', 'kirako', 'ossze'], ['valogat', 'kirako', 'zap'], ['kirako', 'valogat', 'zap']],
    pts: { ketto: 10, ossze: 12, zap: 14, valogat: 18, kirako: 20 },
    label: id => W[id].w,
    ask: (id, kind, q) => kinds[kind](W[id], q),
    rooms: [
      { id: 'felsz', name: 'Szaladjon! Felszólító mód', ic: '🏃', cls: 'c1', items: byCat('felsz') },
      { id: 'targy', name: 'Tudja, látjuk: mit csinál vele?', ic: '🎯', cls: 'c4', items: byCat('targy') },
      { id: 'birt', name: 'Kié? Anyja, barátja', ic: '👪', cls: 'c3', items: byCat('birt') },
      { id: 'dt', name: 'Halk d: küldték, mondta', ic: '🤫', cls: 'c2', items: byCat('dt') },
      { id: 'ossze', name: 'Kivétel: olvassa, hozza', ic: '⚠️', cls: 'c6', items: byCat('ossze') },
      { id: 'mind', name: 'Nagy vegyes', ic: '🎲', cls: 'c5', items: W.map(x => x.id) }
    ],
    album: () => [['🏃 Felszólító mód', 'felsz'], ['🎯 Tárgyas ragozás', 'targy'], ['👪 Kié?', 'birt'], ['🤫 Halk d', 'dt'], ['⚠️ Kivételek', 'ossze']]
      .map(([t, c]) => [t, W.filter(x => x.cat === c).map(x => [x.id, `${x.w}  (${x.to} + ${x.told}${c === 'ossze' ? '' : ', kiejtve: ' + x.pron})`])])
  });
})();
