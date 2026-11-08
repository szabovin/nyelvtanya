# Második forrás: a magyar Hunspell-szótár (Magyarispell, LibreOffice hu_HU) a spylls csomaggal
# Használat: python -I hunspell_check.py <hu_HU szótár útvonala, kiterjesztés nélkül> szavak.txt
import sys
import re
from spylls.hunspell import Dictionary
from spylls.hunspell.data import aff as _aff
# a hu_HU szótár néhány javítási mintája nem érvényes Python-regex; ezeket szó szerint vesszük
_orig = _aff.RepPattern.__post_init__
def _safe(self):
    try: _orig(self)
    except re.error: self.regexp = re.compile(re.escape(self.pattern))
_aff.RepPattern.__post_init__ = _safe
sys.stdout.reconfigure(encoding='utf-8')
d = Dictionary.from_files(sys.argv[1])
for w in open(sys.argv[2], encoding='utf-8').read().split():
    print(('OK  ' if d.lookup(w) else 'NEM ') + w)
