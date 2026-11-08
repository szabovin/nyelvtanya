# data/ige.js előállítása a Wikiszótár-táblákból (ige_wikt.json) és az MTA-ellenőrzésből (ige_check_out.jsonl)
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
d = json.load(open('ige_wikt.json', encoding='utf-8'))
mta = {}
if os.path.exists('ige_check_out.jsonl'):
    for l in open('ige_check_out.jsonl', encoding='utf-8'):
        if l.startswith('{'): x = json.loads(l); mta[x['w']] = x['r']
bad = {f for f, r in mta.items() if r.startswith('ismeretlen')}
out = {}
for v, t in d.items():
    if len(t) != 4: continue
    # a portál által ismeretlennek jelzett mellékváltozatot kihagyjuk; ha a cella fő alakja ismeretlen, az egész igét
    cells = {k: [[f for f in c if f.rstrip('*') not in bad] for c in t[k]] for k in t}
    if any(not c or c[0] != t[k][i][0] for k in t for i, c in enumerate(cells[k])):
        print('KIHAGYVA', v, [f for k in t for c in t[k] for f in c if f.rstrip('*') in bad]); continue
    out[v] = cells
dropped = sorted(f for v in d for k in d[v] for c in d[v][k] for f in c if f.rstrip('*') in bad)
print(len(out), 'ige; elhagyott változatok:', dropped)
js = ('// Nyelvtanya – igeragozás (alanyi ragozás)\n'
      '// Forrás: az angol Wikiszótár (en.wiktionary.org) ragozási táblái, tools/wikt_ige.py; a „van” kézzel.\n'
      '// Minden alakot lekérdeztünk az MTA helyesírási portálján is (tools/mta_check.py), az ott ismeretlen mellékváltozatok kimaradtak.\n'
      '// Egy cella: az elfogadott alakok listája, az első a mutatott alak; a *-os régies alakot elfogadjuk, de nem mutatjuk.\n'
      'const IGE = ' + json.dumps(out, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
open('../data/ige.js', 'w', encoding='utf-8').write(js)
