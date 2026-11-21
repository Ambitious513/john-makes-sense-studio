"""
Gate for a GENERATED take: is the model's figure still the sheet character?

`measure_sheet_fidelity.py` cannot be used here: it compares a keyed render to
the sheet, but a Flow frame has a full background and no key colour. This tool
instead measures three identity proxies that ARE measurable in arbitrary pixels:

  1. HAIR      dark fraction in the head's hair box (sheet ~0.69; a bald/white
               head ~0.00). The sheet's hair silhouette is its strongest token.
  2. PALETTE   median sweater colour vs the sheet's measured sweater median
               (the sheet token #546172, ΔE <= 4).
  3. BODY      width/height of the dark body envelope vs the sheet's, ±25 %.

The character is located automatically: an eroded dark-mask (15x15 window, 70 %
filled) keeps solid sweater/trouser areas and rejects thin building edges, lamp
posts and window frames. The largest tall component in the left half is him.
The head box is placed above the body top at 0.17x body height.

    python tools/measure_generated_take.py <frame.jpg> [<frame2.jpg> ...]

With a directory of frames, pass them in order; the tool also reports frame-to-
frame box drift so a "locked camera" can be checked instead of trusted.

These are proxies, not proof of acting. A take can pass all three and still be
the wrong person; a human still watches the clip.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "psychology-channel/out/look/sheet-a.jpg"
# sheet fig1 (the SAD figure, x798..1124 in the 2752-px sheet), measured once:
SHEET_BODY = (800, 359, 1117, 1373)
SHEET_HAIR = (990, 160, 1115, 250)
SHEET_SWEATER = (430, 650, 900, 1070)  # y0,y1,x0,x1
DARK = 110


def median_rgb(img: np.ndarray, y0: int, y1: int, x0: int, x1: int) -> np.ndarray:
    return np.median(img[y0:y1, x0:x1].reshape(-1, 3), axis=0)


def dark_fraction(img: np.ndarray, y0: int, y1: int, x0: int, x1: int) -> float:
    return float((img[y0:y1, x0:x1].mean(axis=2) < DARK).mean())


def srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    c = rgb.astype(float) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = c
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883
    f = np.where(np.array([x, y, z]) > 0.008856, np.cbrt(np.array([x, y, z])), 7.787 * np.array([x, y, z]) + 16 / 116)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def delta_e(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(srgb_to_lab(a) - srgb_to_lab(b)))


def body_box(img: np.ndarray) -> tuple[int, int, int, int]:
    """(x0,x1,y0,y1) of the solid dark body, or raises."""
    h, w, _ = img.shape
    dark = (img.mean(axis=2) < DARK).astype(np.int32)
    k = 15
    ii = np.pad(dark, ((1, 0), (1, 0))).cumsum(axis=0).cumsum(axis=1)
    r = k // 2
    solid = (ii[k:, k:] - ii[:-k, k:] - ii[k:, :-k] + ii[:-k, :-k]) >= int(0.7 * k * k)
    solid[:, int(0.52 * w) :] = False  # the man is in the left half of these takes
    seen = np.zeros_like(solid)
    ys, xs = np.where(solid)
    best: tuple[int, int, int, int, int] | None = None
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        stack = [(y0, x0)]
        seen[y0, x0] = True
        n, xlo, xhi, ylo, yhi = 0, x0, x0, y0, y0
        while stack:
            y, x = stack.pop()
            n += 1
            xlo, xhi, ylo, yhi = min(xlo, x), max(xhi, x), min(ylo, y), max(yhi, y)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < solid.shape[0] and 0 <= xx < solid.shape[1] and solid[yy, xx] and not seen[yy, xx]:
                    seen[yy, xx] = True
                    stack.append((yy, xx))
        if n > 150 and (yhi - ylo) > 0.22 * h:
            cand = (n + 2 * r, xlo - r, xhi + r, ylo - r, yhi + r)
            if best is None or cand[0] > best[0]:
                best = cand
    if best is None:
        raise RuntimeError("no solid dark body found")
    return best[1], best[2], best[3], best[4]


def measure(path: Path) -> dict:
    img = np.asarray(Image.open(path).convert("RGB"))
    bx0, bx1, by0, by1 = body_box(img)
    bw, bh = bx1 - bx0, by1 - by0
    cx = (bx0 + bx1) // 2
    head_h = max(12, int(0.17 * bh))
    hy0, hy1 = max(0, by0 - head_h), by0 + 4
    hx0, hx1 = max(0, cx - head_h // 2), min(img.shape[1], cx + head_h // 2)
    hair_y1 = hy0 + max(4, int(0.55 * (hy1 - hy0)))
    hair = dark_fraction(img, hy0, hair_y1, hx0, hx1)
    # sweater: the upper third of the dark body, middle half horizontally
    sw_y0, sw_y1 = by0 + int(0.04 * bh), by0 + int(0.36 * bh)
    sw_x0, sw_x1 = bx0 + int(0.22 * bw), bx1 - int(0.22 * bw)
    sweater = median_rgb(img, sw_y0, sw_y1, sw_x0, sw_x1)
    return {
        "file": path.name,
        "box": (bx0, bx1, by0, by1),
        "aspect": bw / max(bh, 1),
        "hair": hair,
        "sweater": sweater,
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    sheet = np.asarray(Image.open(SHEET).convert("RGB"))
    ref_hair = dark_fraction(
        sheet, SHEET_HAIR[1], SHEET_HAIR[3], SHEET_HAIR[0], SHEET_HAIR[2]
    )
    ref_sweater = median_rgb(sheet, SHEET_SWEATER[0], SHEET_SWEATER[1], SHEET_SWEATER[2], SHEET_SWEATER[3])
    ref_aspect = (SHEET_BODY[2] - SHEET_BODY[0]) / (SHEET_BODY[3] - SHEET_BODY[1])

    print(f"sheet: hair {ref_hair:.2f} | sweater #{''.join(f'{int(v):02X}' for v in ref_sweater)}"
          f" | body aspect {ref_aspect:.3f}")
    print()
    print(f"{'frame':<14} {'hair':>6} {'sweater':>9} {'dE':>6} {'aspect':>7} {'drift':>7}  gates")
    failed = False
    prev: dict | None = None
    for arg in sys.argv[1:]:
        m = measure(Path(arg))
        de = delta_e(m["sweater"], ref_sweater)
        drift = 0.0
        if prev is not None:
            a, b = prev["box"], m["box"]
            drift = math.hypot((a[0] + a[1] - b[0] - b[1]) / 2, (a[2] + a[3] - b[2] - b[3]) / 2)
        hair_ok = m["hair"] >= 0.45 * ref_hair
        pal_ok = de <= 4.0
        shape_ok = abs(m["aspect"] - ref_aspect) <= 0.25 * ref_aspect
        gate = " ".join(
            [
                "HAIR:" + ("ok" if hair_ok else "FAIL"),
                "PALETTE:" + ("ok" if pal_ok else "FAIL"),
                "BODY:" + ("ok" if shape_ok else "FAIL"),
            ]
        )
        failed |= not (hair_ok and pal_ok and shape_ok)
        col = "".join(f"{int(v):02X}" for v in m["sweater"])
        print(f"{m['file']:<14} {m['hair']:6.2f} {col:>9} {de:6.1f} {m['aspect']:7.3f} {drift:7.1f}  {gate}")
        prev = m
    print()
    print("GATE: any FAIL -> take rejected (identity drift is not a style choice)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
