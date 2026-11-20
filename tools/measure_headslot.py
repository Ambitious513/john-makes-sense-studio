"""Head-slot occlusion gate — does a costume slot paint over the eyes?

Costume slots (`headSlot`) are drawn on the skull, under the face, so the art
still has to clear the eye band: a brim on the eye line hides the pupils and
the character reads dead. This measures the rendered audit instead of eyeballing
it.

Render the audit first (from the repo root):

    npx remotion still psychology-channel/src/look/look-index.tsx HeadSlotAudit \
        psychology-channel/out/look/slots.png

    python tools/measure_headslot.py

Geometry, so the numbers are checkable by hand:
  viewBox HEAD_BOX = 214 units, rendered 'meet' into 312x360 -> 1.458x, content
  centred vertically (+24 px), then each panel scales 1.35x. EYE_Y 89,
  EYE_R 23.5 -> eyes occupy local y 65.5..112.5, x 293..397.

Gate: inside the eye x-range the eye band must show the same ink as its no-slot
baseline (pupils intact) and zero costume red — front AND profile.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STILL = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "psychology-channel/out/look/slots.png"
if not STILL.is_absolute():
    STILL = (Path.cwd() / STILL).resolve()

a = np.asarray(Image.open(STILL).convert("RGB")).astype(np.int16)
H, W, _ = a.shape
ink = (a[:, :, 0] < 45) & (a[:, :, 1] < 45) & (a[:, :, 2] < 45)
red = (a[:, :, 0] > 160) & (a[:, :, 1] < 120) & (a[:, :, 2] < 120)

FIT = 1.458
PANEL, GAP, TOP = 440, 16, 42


def ix(x_local: float) -> float:
    return (x_local - 238) * FIT * 1.35


def iy(y_local: float) -> float:
    return ((y_local + 12) * FIT + 24) * 1.35 + TOP


panels = [
    ("FRONT none", 0),
    ("SIDE  none", 1),
    ("FRONT beanie", 2),
    ("SIDE  beanie", 3),
    ("FRONT band", 4),
    ("SIDE  band", 5),
]
row_left = (W - (len(panels) * PANEL + (len(panels) - 1) * GAP)) // 2
eye_top, eye_bot = int(iy(65.5)), int(iy(112.5))
print(f"{STILL.name}: {W}x{H}  eye band y {eye_top}..{eye_bot}")

rows = {}
print(f"\n{'panel':<14} {'ink·eyeX':>9} {'red·eyeX':>9} {'red low':>8}")
for name, i in panels:
    left = row_left + i * (PANEL + GAP)
    ex0, ex1 = int(left + ix(293)), int(left + ix(397))
    band = slice(eye_top, eye_bot)
    ink_eye = int(ink[band, ex0:ex1].sum())
    red_eye = int(red[band, ex0:ex1].sum())
    rr = np.where(red[:, left : left + PANEL].any(axis=1))[0]
    rows[name] = (ink_eye, red_eye)
    print(f"{name:<14} {ink_eye:>9} {red_eye:>9} {(int(rr.max()) if len(rr) else -1):>8}")

print("\nGATE: red·eyeX == 0 and ink·eyeX within 2% of the matching baseline")
ok = True
for view in ("FRONT", "SIDE"):
    base = rows[next(n for n in rows if n.upper().startswith(view) and n.endswith("none"))][0]
    for name in [n for n in rows if n.upper().startswith(view) and not n.endswith("none")]:
        got, red_eye = rows[name]
        delta = 100 * (got - base) / max(base, 1)
        good = red_eye == 0 and abs(delta) <= 2.0
        ok &= good
        print(f"  {name:<14} ink {got} vs {base} ({delta:+.1f}%)  red {red_eye}  {'PASS' if good else 'FAIL'}")

print("\nRESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
