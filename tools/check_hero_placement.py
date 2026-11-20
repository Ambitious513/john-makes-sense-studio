"""Where is the character in the frame, and is he standing ON the street?

Finds the hero's ink mass inside the hero box and reports the top of the head,
the bottom of the shoes and the ground line, so a placement error (the figure
floating above the pavement, or sunk into it) is a number, not a guess.

Usage: python tools/check_hero_placement.py <frame.png> [ground_y]
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image

SRC = Path(sys.argv[1])
GROUND_Y = int(sys.argv[2]) if len(sys.argv) > 2 else 830

a = np.asarray(Image.open(SRC).convert("RGB")).astype(np.int16)
H, W, _ = a.shape
hx0, hx1 = int(0.34 * W - 203), int(0.34 * W + 203)

# the character is the only near-black mass in the hero column band above the
# pavement (props are outside this x range for most frames)
sub = a[:, hx0:hx1, :]
dark = sub.max(axis=2) < 90
rows = np.flatnonzero(dark.sum(axis=1) >= 4)
above = rows[rows < GROUND_Y + 30]
top, bot = (int(above.min()), int(above.max())) if len(above) else (0, 0)
height = bot - top
print(f"{SRC.name}: hero ink rows {top}..{bot}  height {height} px")
print(f"  ground line {GROUND_Y}  ->  shoe bottom is {bot - GROUND_Y:+d} px from it")
print(f"  figure height {height} px (expected ~{int(1000 * 0.7)} at scale 0.7)")

ok = abs((bot - GROUND_Y)) <= 6 and abs(height - 700) <= 25
print(f"\nGATE: soles on the ground line and the figure is 700 px tall -> {'PASS' if ok else 'FAIL'}")
sys.exit(0 if ok else 1)
