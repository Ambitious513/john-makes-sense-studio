"""Does the RENDERED walk skate? Measured from the actual frames.

The gait tests prove the math plants the foot. This proves the shipped pixels do
it too, which is the only thing a viewer can check:

  * the pavement's expansion joints give the ground layer's true screen shift;
  * the shoe pixels touching the ground line give the planted foot's true shift;
  * for a planted foot those two must be the SAME number.

Anything else is skating, no matter what the IK promises.

Render two frames a few apart, inside one stance window:

    npx remotion still psychology-channel/src/index.ts StreetWalk \
        psychology-channel/out/street/f60.png --frame=60
    ... --frame=65

    python tools/measure_render_slip.py psychology-channel/out/street/f60.png \
        psychology-channel/out/street/f65.png
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image

GROUND_Y = 830
JOINT = np.array([218, 209, 192], dtype=np.int16)  # #DAD1C0
WALK_WAY = np.array([237, 229, 214], dtype=np.int16)  # #EDE5D6


def load(p: str) -> np.ndarray:
    return np.asarray(Image.open(p).convert("RGB")).astype(np.int16)


def joint_columns(a: np.ndarray):
    """x positions of the pavement joints, sampled below the horizontal seam."""
    band = a[912:922, :, :]
    is_joint = (np.abs(band - JOINT).sum(axis=2) < 40).any(axis=0)
    is_way = (np.abs(band - WALK_WAY).sum(axis=2) < 40).any(axis=0)
    cand = np.flatnonzero(is_joint & ~is_way)
    # cluster adjacent columns
    out, cur = [], [cand[0]]
    for x in cand[1:]:
        if x - cur[-1] <= 3:
            cur.append(x)
        else:
            out.append(sum(cur) / len(cur))
            cur = [x]
    out.append(sum(cur) / len(cur))
    return out


def shoe_clusters(a: np.ndarray, x0: int, x1: int):
    """Centroids of real shoe MASS inside the character's box.

    The props also sit on the ground line and have dark outlines, so scanning the
    whole frame finds lamppost bases instead of feet (it did, and produced a
    vacuous pass). Shoes are ~45 px wide blocks of near-black ~20 px tall, so the
    search is limited to the hero box and the mass threshold is raised.
    """
    band = a[GROUND_Y - 22 : GROUND_Y - 1, x0:x1, :]
    dark = (band.max(axis=2) < 75)
    cols = dark.sum(axis=0)
    cand = np.flatnonzero(cols >= 12)
    if not len(cand):
        return []
    out, cur = [], [cand[0]]
    for x in cand[1:]:
        if x - cur[-1] <= 8:
            cur.append(x)
        else:
            out.append((x0 + sum(cur) / len(cur), len(cur)))
            cur = [x]
    out.append((x0 + sum(cur) / len(cur), len(cur)))
    return [c for c in out if c[1] >= 14]


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    a, b = load(sys.argv[1]), load(sys.argv[2])
    fa = int(Path(sys.argv[1]).stem.lstrip("f"))
    fb = int(Path(sys.argv[2]).stem.lstrip("f"))
    n = fb - fa

    ja, jb = joint_columns(a), joint_columns(b)
    # the hero box: left = 0.34*W - boxW/2, boxW = 580*0.7 (StreetWalk.tsx)
    hx0, hx1 = int(0.34 * 1920 - 406 / 2), int(0.34 * 1920 + 406 / 2)
    sa, sb = shoe_clusters(a, hx0, hx1), shoe_clusters(b, hx0, hx1)
    print(f"hero box x {hx0}..{hx1}")

    # match joints by nearest position, allowing the tile wrap
    tile = 130.0
    shifts = []
    for x in ja:
        d = min(((y - x) % tile) - tile / 2 if ((y - x) % tile) > tile / 2 else (y - x) % tile for y in jb)
        shifts.append(d)
    # simplest robust estimate: mean of the wrapped differences of the first 12
    wrapped = []
    for x in ja[:14]:
        cands = [y - x for y in jb]
        cands = [c for c in cands if abs(c) < tile]
        if cands:
            wrapped.append(min(cands, key=abs))
    pavement = float(np.median(wrapped)) if wrapped else float("nan")

    print(f"frames {fa} -> {fb} ({n} frames)")
    print(f"  pavement joints found: {len(ja)} -> {len(jb)}   measured shift {pavement:+.2f} px")

    print(f"  shoe clusters: {len(sa)} -> {len(sb)}")
    for i, (cx, w) in enumerate(sa):
        print(f"    f{fa} shoe{i}: x {cx:7.1f} width {w}")
    for i, (cx, w) in enumerate(sb):
        print(f"    f{fb} shoe{i}: x {cx:7.1f} width {w}")

    # the planted foot: match each shoe in A to the nearest shoe in B
    if sa and sb:
        best = None
        for (cxa, wa) in sa:
            for (cxb, wb) in sb:
                d = cxb - cxa
                if best is None or abs(d - pavement) < abs(best - pavement):
                    best = d
        foot = float(best)
        residual = foot - pavement
        print(f"\n  planted-foot screen shift : {foot:+.2f} px")
        print(f"  ground screen shift         : {pavement:+.2f} px")
        print(f"  RESIDUAL SLIP               : {residual:+.2f} px over {n} frames "
              f"= {abs(residual) / n:.2f} px/frame")
        ok = abs(residual) / n < 0.5
        print(f"\nGATE: rendered slip < 0.5 px/frame -> {'PASS' if ok else 'FAIL'}")
        return 0 if ok else 1
    print("no shoes detected")
    return 2


if __name__ == "__main__":
    sys.exit(main())
