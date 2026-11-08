# Szavak ellenőrzése az MTA helyesírási portálján (helyesiras.mta.hu)
# Használat: python -I tools/mta_check.py szo1 szo2 ...   vagy   python -I tools/mta_check.py -f lista.txt
import re, sys, time, json, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

def check(word):
    url = 'https://helyesiras.mta.hu/helyesiras/default/suggest?q=' + urllib.parse.quote(word)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Nyelvtanya szoellenorzo)'})
    h = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    h = re.sub(r'(?s)<(script|style)[^>]*>.*?</\1>', '', h)
    t = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h)).replace('&bdquo;', '„').replace('&rdquo;', '”')
    m = re.search(r'„' + re.escape(word) + r'”:\s*(.*?)(?:megosztás|További információk)', t)
    return m.group(1).strip() if m else '??? ' + t[t.find('Ellenőrizendő'):][:200]

if __name__ == '__main__':
    words = open(sys.argv[2], encoding='utf-8').read().split() if sys.argv[1] == '-f' else sys.argv[1:]
    for w in words:
        print(json.dumps({'w': w, 'r': check(w)}, ensure_ascii=False), flush=True)
        time.sleep(0.4)
