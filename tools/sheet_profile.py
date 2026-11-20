"""Run-length silhouette profile — the trustworthy width measurement.

Per-row max-min spans get inflated by JPEG noise at the figure's edges, which is
exactly why two measurements of the same sheet disagreed. Here each row keeps
only contiguous runs of at least MIN px, so a stray pixel cannot widen a body.

Usage: python tools/sheet_profile.py            # sheet fig1 + our render
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "psychology-channel/out/look/sheet-a.jpg"
OURS = ROOT / "psychology-channel/out/look/sweater-match.png"
PAPER = np.array([252, 245, 235], dtype=np.int16)
MIN_RUN = 8


def mask(path, box=None):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    if box:
        a = a[box[1] : box[3], box[0] : box[2]]
    return np.abs(a - PAPER).sum(axis=2) > 90


def runs(row: np.ndarray, min_len: int = MIN_RUN):
    out, s = [], None
    for i, v in enumerate(row):
        if v and s is None:
            s = i
        elif not v and s is not None:
            if i - s >= min_len:
                out.append((s, i - 1))
            s = None
    if s is not None and len(row) - s >= min_len:
        out.append((s, len(row) - 1))
    return out


def profile(m: np.ndarray, h: int = 1000):
    """(width_units, n_runs, centre_units) sampled at every 1/h of the figure."""
    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    hh = y1 - y0 + 1
    scale = 1000 / hh
    prof = []
    for u in range(0, 1000, 20):
        y = int(y0 + u / 1000 * hh)
        r = runs(m[y, x0 : x1 + 1])
        if not r:
            prof.append((0, 0, 0))
            continue
        w = (r[-1][1] - r[0][0] + 1) * scale
        c = ((r[0][0] + r[-1][1]) / 2) * scale
        prof.append((w, len(r), c))
    return prof, (x1 - x0 + 1) * scale, hh


pm = mask(SHEET, box=(800, 148, 1117, 1374))
po = mask(OURS)
sp, sw, sh = profile(pm)
op, ow, oh = profile(po)

print(f"sheet fig1: bbox h {sh} px, width/height {sw:.3f}   ours: bbox h {oh} px, w/h {ow:.3f}")
print(f"\n{'u':>5} {'sheet w':>8} {'runs':>5} {'ours w':>8} {'runs':>5} {'d':>7}")
for i in range(0, len(sp), 2):
    s, o = sp[i], op[i]
    print(f"{i*20:5d} {s[0]:8.0f} {s[1]:5d} {o[0]:8.0f} {o[1]:5d} {o[0]-s[0]:+7.0f}")
