"""Silhouette fidelity of our rendered character vs the supplied sheet.

The gate that decides whether the code-built character IS the sheet character.
Both silhouettes are extracted, turned into solid envelopes, normalised to one
height (head top to SOLE line), aligned on the ground and the x-centroid, then
compared with IoU and a per-row width profile.

Four measurement traps this handles — each one produced a wrong number first:
  1. Skin is ~3/255 from the sheet's paper, so a threshold mask is a hollow
     outline and rows measure the stroke, not the body. Our harness therefore
     renders on a flat KEY colour, and both sides are row-filled into solid
     envelopes.
  2. JPEG speckle around the sheet's figures creates 2-5 px runs tens of units
     away from the body, inflating a max-min span by up to 2x. A morphological
     opening removes it — on the sheet ONLY, because the same erosion deletes
     our 4.5-unit head outline.
  3. The sheet's beige ground shadow and its dark speckles reach 7.6% below the
     soles; normalising to the raw bounding box shortens the whole body. FIG1's
     bottom is the sole line (tools/sheet_feet.py).
  4. Sheet fig1 is slouched and its column group is noisy, so landmark widths
     were cross-checked with tools/sheet_probe.py before being trusted.

Render the harness first (from the repo root):

    npx remotion still psychology-channel/src/look/look-index.tsx SweaterMatch \
        psychology-channel/out/look/sweater-match.png

    python tools/measure_sheet_fidelity.py
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "psychology-channel/out/look/sweater-match.png"
SHEET = ROOT / "psychology-channel/out/look/sheet-a.jpg"
PAPER = np.array([252, 245, 235], dtype=np.int16)
KEY = np.array([240, 31, 212], dtype=np.int16)  # must match SweaterMatch.tsx
THRESH = 90
NORM_H = 1000
# sheet fig1: x 800..1116, head top y148, sole line y1373
FIG1 = (800, 148, 1117, 1373)


def mask_of(arr: np.ndarray, ref: np.ndarray) -> np.ndarray:
    return np.abs(arr - ref).sum(axis=2) > THRESH


def envelope(m: np.ndarray) -> np.ndarray:
    """Fill every row between its outermost pixels: a solid silhouette."""
    out = np.zeros_like(m)
    for y in range(m.shape[0]):
        xs = np.flatnonzero(m[y])
        if len(xs):
            out[y, xs.min() : xs.max() + 1] = True
    return out


def despeckle(m: np.ndarray) -> np.ndarray:
    """Morphological opening — sheet side only (it would erase our thin ink work)."""
    img = Image.fromarray((m.astype(np.uint8)) * 255)
    opened = img.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(9))
    return np.asarray(opened) > 127


def crop(m: np.ndarray) -> np.ndarray:
    ys, xs = np.where(m)
    return m[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def normalise(m: np.ndarray, h: int = NORM_H) -> np.ndarray:
    im = Image.fromarray((m * 255).astype(np.uint8))
    w = max(2, int(round(im.width * h / im.height)))
    return np.asarray(im.resize((w, h), Image.LANCZOS)) > 100


def centred(m: np.ndarray) -> np.ndarray:
    cols = m.sum(axis=0)
    cx = int(round((np.arange(m.shape[1]) * cols).sum() / max(cols.sum(), 1)))
    pad = max(cx, m.shape[1] - cx) + 4
    out = np.zeros((m.shape[0], 2 * pad), dtype=bool)
    out[:, pad - cx : pad - cx + m.shape[1]] = m
    return out


def align(a: np.ndarray, b: np.ndarray):
    a, b = centred(a), centred(b)
    w = max(a.shape[1], b.shape[1]) + 160
    return np.pad(a, ((0, 0), (80, w - a.shape[1] - 80))), np.pad(
        b, ((0, 0), (80, w - b.shape[1] - 80))
    )


def best_iou(a: np.ndarray, b: np.ndarray, search: int = 45):
    """IoU after a small horizontal registration.

    The sheet's figures are slouched — fig1's head sits right of his hips — so
    forcing one centroid penalises proportions we already match. Registering on
    the best overlap measures the BODY, which is what this gate is for.
    """
    best, bdx = 0.0, 0
    for dx in range(-search, search + 1, 3):
        A = np.roll(a, dx, axis=1)
        iou = np.logical_and(A, b).sum() / np.logical_or(A, b).sum()
        if iou > best:
            best, bdx = iou, dx
    return best, bdx


def profile(m: np.ndarray) -> np.ndarray:
    out = np.zeros(m.shape[0])
    for y in range(m.shape[0]):
        xs = np.flatnonzero(m[y])
        out[y] = (xs.max() - xs.min() + 1) if len(xs) else 0
    return out


def main() -> int:
    for f in (OUT, SHEET):
        if not f.exists():
            print(f"missing {f}")
            return 2

    ours = envelope(mask_of(np.asarray(Image.open(OUT).convert("RGB")).astype(np.int16), KEY))
    ref = envelope(
        despeckle(
            mask_of(
                np.asarray(Image.open(SHEET).convert("RGB")).astype(np.int16)[
                    FIG1[1] : FIG1[3], FIG1[0] : FIG1[2]
                ],
                PAPER,
            )
        )
    )
    ours, ref = crop(ours), crop(ref)
    a, b = normalise(ours), normalise(ref)
    print(
        f"ours   envelope {ours.shape[1]}x{ours.shape[0]}  aspect {ours.shape[1]/ours.shape[0]:.3f}"
        f"   sheet envelope {ref.shape[1]}x{ref.shape[0]}  aspect {ref.shape[1]/ref.shape[0]:.3f}"
    )

    A, B = align(a, b)
    iou, dx = best_iou(A, B)
    A = np.roll(A, dx, axis=1)
    pa, pb = profile(A), profile(B)
    mae = np.abs(pa - pb).mean()
    print(
        f"\nIoU {iou:.4f} (registered {dx:+d}u)   width-profile MAE {mae:.1f} u   "
        f"area {A.sum()} vs {B.sum()} ({100*A.sum()/max(B.sum(),1):.1f}% of sheet)"
    )

    print(f"\n{'u':>5} {'ours':>6} {'sheet':>6} {'delta':>7}")
    for u in range(0, 1000, 50):
        d = pa[u] - pb[u]
        flag = "  <<<" if abs(d) > 25 else ""
        print(f"{u:5d} {pa[u]:6.0f} {pb[u]:6.0f} {d:+7.0f}{flag}")

    print(f"\nGATE: IoU >= 0.80 -> {'PASS' if iou >= 0.80 else 'FAIL'}")
    return 0 if iou >= 0.80 else 1


if __name__ == "__main__":
    sys.exit(main())
