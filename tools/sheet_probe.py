"""Probe raw runs in a row band of one sheet figure.

Prints every contiguous run (position, width, median colour) so a claim like
"the hair is 250 units wide" can be checked against the pixels instead of
argued about.

Usage: python tools/sheet_probe.py [figIndex] [uTop] [uBot]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "psychology-channel/out/look/sheet-a.jpg"
FIGS = {0: (354, 692, 112, 1464), 1: (800, 1116, 148, 1373), 2: (1232, 1626, 114, 1464),
        3: (1724, 2092, 114, 1464), 4: (2172, 2574, 124, 1464)}
FIG = int(sys.argv[1]) if len(sys.argv) > 1 else 1
uT = float(sys.argv[2]) if len(sys.argv) > 2 else 20
uB = float(sys.argv[3]) if len(sys.argv) > 3 else 170
x0, x1, ytop, ybot = FIGS[FIG]

a = np.asarray(Image.open(SHEET).convert("RGB")).astype(np.int16)
paper = np.array([252, 245, 235], dtype=np.int16)
m = np.abs(a - paper).sum(axis=2) > 90
hh = ybot - ytop
scale = 1000 / hh
print(f"fig{FIG}: x0={x0} (centre {x0 + (x1-x0)//2}), body height {hh} px, 1u = {hh/1000:.2f} px")

for u in range(int(uT), int(uB) + 1, 10):
    y = int(ytop + u / 1000 * hh)
    row = m[y, x0 - 30 : x1 + 31]
    idx = np.flatnonzero(np.diff(np.concatenate(([0], row.view(np.int8), [0]))))
    rr = [(int(s), int(e)) for s, e in zip(idx[0::2], idx[1::2]) if e - s >= 2]
    parts = []
    for s, e in rr:
        med = np.median(a[y, x0 - 30 + s : x0 - 30 + e], axis=0).astype(int)
        parts.append(f"[{(s-30)*scale:+5.0f}..{(e-30)*scale:+5.0f} w{(e-s)*scale:4.0f} #{'%02X%02X%02X' % tuple(med)}]")
    span = (rr[-1][1] - rr[0][0]) * scale if rr else 0
    print(f"u{u:4d} y{y} runs {len(rr)}  span {span:5.0f}u  " + " ".join(parts))
