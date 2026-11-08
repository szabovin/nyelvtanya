# Igeragozási táblák letöltése az angol Wikiszótárból (en.wiktionary.org)
# Kimenet: ige_wikt.json  {ige: {idő: [6 alak, mindegyik a változatok listája]}}
import re, sys, json, time, urllib.error, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
UA = {'User-Agent': 'NyelvtanyaBot/0.1 (personal learning game)'}
ROWS = {('indicative', 'present'): 'jelen', ('indicative', 'past'): 'mult',
        ('conditional', 'present'): 'felt', ('subjunctive', 'present'): 'felsz'}

def table(verb):
    url = 'https://en.wiktionary.org/api/rest_v1/page/html/' + urllib.parse.quote(verb)
    h = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode('utf-8')
    h = h[h.find('id="Hungarian"'):]
    h = h[h.find('onjugation'):]
    h = h[:h.find('</table>')]
    res, mood, tense = {}, None, None
    for r in re.findall(r'(?s)<tr[^>]*>(.*?)</tr>', h):
        cells = [re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', c)).replace('\xad', '').strip()
                 for c in re.findall(r'(?s)<t[hd][^>]*>(.*?)</t[hd]>', r)]
        for c in cells[:3]:
            if c in ('indicative', 'conditional', 'subjunctive'): mood = c
            if c in ('present', 'past'): tense = c
        if 'indef.' in cells:
            forms = cells[cells.index('indef.') + 1:]
            key = ROWS.get((mood, tense))
            if key and key not in res and len(forms) >= 6:
                res[key] = [[v.strip() for v in re.split(r'\s+or\s*|\s*\(or\s+|\)', f) if v.strip()] for f in forms[:6]]
    return res

if __name__ == '__main__':
    verbs = sys.argv[1:]
    try: out = json.load(open('ige_wikt.json', encoding='utf-8'))
    except FileNotFoundError: out = {}
    for v in verbs:
        if len(out.get(v, {})) == 4: continue
        try:
            for proba in range(4):
                try: out[v] = table(v); break
                except urllib.error.HTTPError as e:
                    if e.code != 429 or proba == 3: raise
                    time.sleep(30)
            print(v, 'OK' if len(out[v]) == 4 else 'HIÁNYOS ' + str(list(out[v])), flush=True)
        except Exception as e:
            print(v, 'HIBA', e, flush=True)
        time.sleep(3)
    json.dump(out, open('ige_wikt.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
