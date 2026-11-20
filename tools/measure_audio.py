"""Measure a file's loudness and true peak — the delivery numbers, in one command.

    python tools/measure_audio.py <file> [<file> ...]

Uses ffmpeg's own R128/EBU R128 measurement (loudnorm print_format=json), which
is what the delivery gates are specified against: -14 LUFS +/- 1, <= -1 dBTP.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

AF = "loudnorm=I=-14:TP=-1:LRA=11:print_format=json"


def measure(path: str):
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", AF, "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m = re.search(r"\{[^{}]*\"input_i\"[\s\S]*?\}", log)
    return json.loads(m.group(0)) if m else None


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    bad = 0
    for p in argv:
        m = measure(p)
        if not m:
            print(f"{Path(p).name}: no audio stream (or unreadable)")
            bad += 1
            continue
        i, tp = float(m["input_i"]), float(m["input_tp"])
        ok = abs(i + 14) <= 1.0 and tp <= -1.0
        if not ok:
            bad += 1
        print(
            f"{Path(p).name:<34} {i:7.2f} LUFS   {tp:6.2f} dBTP   "
            f"LRA {m['input_lra']:>5}  {'PASS' if ok else 'FAIL'}"
        )
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
