"""Exact token colours at measured landmark points of one sheet figure.

Coordinates come from tools/sheet_rows.py's landmark table, so each sample sits
inside the material it names (hair mass, face interior, sweater body, pant leg,
shoe, ground shadow) rather than being a guessed hex.

Usage: python tools/sheet_tokens.py <sheet.jpg>
"""
import sys
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1])
im = Image.open(SRC).convert("RGB")
a = im.load()

# fig1 box x 800..1116, y 148..1465 (h 1317) -> u = (y-148)/1317*1000
X0, Y0, H = 800, 148, 1317
CX = (800 + 1116) // 2


def at(u, dx=0):
    y = int(round(Y0 + u / 1000 * H))
    return a[CX + dx, y]


def block(u, dx=0, r=6):
    y = int(round(Y0 + u / 1000 * H))
    pts = [a[x, yy] for yy in range(y - r, y + r) for x in range(CX + dx - r, CX + dx + r)]
    pts.sort()
    return pts[len(pts) // 2]


def hexs(p):
    return "#%02X%02X%02X" % p


print(f"{SRC.name}  fig1 centre x={CX}  u-scale: y = {Y0} + u/1000*{H}")
for name, u, dx in [
    ("hair", 55, 0),
    ("hair-side", 40, -60),
    ("face", 95, 0),
    ("cheek", 115, 25),
    ("collar", 168, 0),
    ("sweater", 300, 0),
    ("sweater-hem", 390, 0),
    ("sweater-shade", 300, -70),
    ("pants", 500, -30),
    ("pants-r", 500, 30),
    ("pants-low", 860, -30),
    ("shoe", 930, -60),
    ("shoe-r", 930, 60),
    ("outline", 95, -76),
]:
    print(f"  {name:<14} u{u:>4} dx{dx:>4}   {hexs(block(u, dx))}")

# ground shadow: just below the feet
for dy in (8, 16, 26, 40):
    y = 1465 + dy
    pts = sorted(a[x, y] for x in range(CX - 90, CX + 90, 3))
    print(f"  shadow+{dy:<3}px      {hexs(pts[len(pts)//2])}")
