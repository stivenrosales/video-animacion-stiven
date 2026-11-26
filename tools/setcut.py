"""Write START/END/LAST_WORD_END/MANUAL_CUTS into a video's scripts/cut.py (fresh from the template).

Usage: python3 tools/setcut.py <video-dir> START END LAST_WORD_END 'a-b:note' ...
"""
import re
import sys

d, start, end, last = sys.argv[1], *map(float, sys.argv[2:5])
cuts = []
for c in sys.argv[5:]:
    span, _, note = c.partition(":")
    a, b = map(float, span.split("-"))
    cuts.append(f"    ({a:.2f}, {b:.2f}),  # {note}\n")
p = f"{d}/scripts/cut.py"
s = open(p).read()
s = re.sub(r"START, END = .*\n", f"START, END = {start:.2f}, {end:.2f}\n", s, count=1)
s = re.sub(r"LAST_WORD_END = .*\n", f"LAST_WORD_END = {last:.2f}  # last word ends here; the breath after it stays\n", s, count=1)
a = s.index("MANUAL_CUTS = ")
b = s.index("\n\n", a)
s = s[:a] + "MANUAL_CUTS = [  # retakes and restarts: keep the last version\n" + "".join(cuts) + "]" + s[b:]
open(p, "w").write(s)
