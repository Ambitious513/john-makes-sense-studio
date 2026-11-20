"""Disambiguate shoe from ground-shadow for one sheet figure.

Prints every contiguous run in the foot rows with its median colour, so the sole
line (dark, wide) is separated from the beige shadow ellipse (#E2D6C8) that sits
under it. Without this the figure's height normalisation silently includes the
shadow and every proportion is off by ~6%.

Usage: python tools/sheet_feet.py [figIndex]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "psychology-channel/out/look/sheet-a.jpg"
FIGS = {
    0: (354, 692, 112, 1464),
    1: (800, 1116, 148, 1465),
    2: (1232, 1626, 114, 1464),
    3: (1724, 2092, 114, 1464),
    4: (2172, 2574, 124, 1464),
}
FIG = int(sys.argv[1]) if len(sys.argv) > 1 else 1
x0, x1, ytop, ybot = FIGS[FIG]

a = np.asarray(Image.open(SHEET).convert("RGB")).astype(np.int16)
paper = np.array([252, 245, 235], dtype=np.int16)
m = np.abs(a - paper).sum(axis=2) > 90


def runs(row):
    out, s = [], None
    for i, v in enumerate(row):
        if v and s is None:
            s = i
        elif not v and s is not None:
            out.append((s, i - 1))
            s = None
    if s is not None:
        out.append((s, len(row) - 1))
    return out


print(f"fig{FIG} foot rows (x offsets relative to {x0}):")
for y in range(ybot - 200, ybot + 12, 6):
    row = m[y, x0 : x1 + 1]
    rr = [(s, e) for s, e in runs(row) if e - s >= 5]
    if not rr:
        print(f"  y{y} (u{1000*(y-ytop)/(ybot-ytop):5.1f})  -")
        continue
    parts = []
    for s, e in rr:
        pts = a[y, x0 + s : x0 + e + 1]
        med = np.median(pts, axis=0).astype(int)
        kind = "SHOE" if max(med) < 90 else ("shadow" if med[0] > 200 and med[2] < 220 else "other")
        parts.append(f"[{s}..{e} w{e-s+1} #{'%02X%02X%02X' % tuple(med)} {kind}]")
    print(f"  y{y} (u{1000*(y-ytop)/(ybot-ytop):5.1f})  " + "  ".join(parts))
