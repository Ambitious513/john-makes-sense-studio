#!/usr/bin/env python3
"""Final delivery pass: loudness-normalise to the platform target and copy video.

The Remotion render is the picture master; this pass only fixes the audio
delivery — YouTube normalises to -14 LUFS, and the raw render sits at ~-18.8,
so every episode ships quieter than intended. Two-pass loudnorm (measure, then
apply with measured values + linear mode) hits the target without re-encoding
the picture.

Usage: python tools/final_mix.py <in.mp4> <out.mp4>
"""
import json
import re
import subprocess
import sys

TARGET_I = -14.0
# AAC encoding raises the file's true peak by ~0.4 dB above the filter's
# output, so aim the limiter at -2.0 to land the encoded file safely under
# the -1.0 dBTP delivery ceiling (measured: -14.7 LUFS / -1.7 dBTP).
TARGET_TP = -2.0
TARGET_LRA = 11.0


def run(args):
    return subprocess.run(args, capture_output=True, text=True).stderr


def measure(path):
    log = run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", path,
        "-af", f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
        "-f", "null", "-",
    ])
    m = re.search(r"\{[^{}]*\"input_i\"[\s\S]*?\}", log)
    return json.loads(m.group(0)) if m else None


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]

    m1 = measure(src)
    if not m1:
        print("could not measure loudness (is there an audio stream?)")
        sys.exit(1)
    print(f"in : {m1['input_i']} LUFS | peak {m1['input_tp']} dBTP | LRA {m1['input_lra']}")

    af = (
        f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:"
        f"measured_I={m1['input_i']}:measured_TP={m1['input_tp']}:"
        f"measured_LRA={m1['input_lra']}:measured_thresh={m1['input_thresh']}:"
        f"offset={m1['target_offset']}:linear=true"
    )
    run([
        "ffmpeg", "-y", "-i", src, "-af", af,
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", dst,
    ])

    m2 = measure(dst)
    if m2:
        print(f"out: {m2['input_i']} LUFS | peak {m2['input_tp']} dBTP")
    print(f"-> {dst}")


if __name__ == "__main__":
    main()
