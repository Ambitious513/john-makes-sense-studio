# tts.py — generate narration audio + word timings with edge-tts (free, no API key).
#
# Output: <out>.mp3 (the voice line) and <out>.words.json (per-word start/end in frames,
# so Remotion can sync lip-sync, shot cuts and SFX to the actual narration).
#
# Usage:
#   .venv\Scripts\python.exe tools\tts.py --text "Your brain isn't broken." --out public/voice/line-01
#   Optional: --voice en-US-AndrewNeural --fps 30 --rate "-4%"
#
# ElevenLabs can replace this later as a swappable provider (same output contract:
# <out>.mp3 + <out>.words.json). No app code needs to change.

import argparse
import asyncio
import json
import pathlib
import sys

import edge_tts

# 100-nanosecond units per second (edge-tts timestamps are in this unit)
TICKS_PER_SECOND = 10_000_000


async def generate(text: str, out: str, voice: str, fps: int, rate: str | None) -> dict:
    out_path = pathlib.Path(out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    mp3_path = out_path.with_suffix(".mp3")
    json_path = out_path.with_suffix(".words.json")

    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary") if rate else edge_tts.Communicate(text, voice, boundary="WordBoundary")

    words: list[dict] = []

    with open(mp3_path, "wb") as audio:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                offset = chunk["offset"] / TICKS_PER_SECOND
                duration = chunk["duration"] / TICKS_PER_SECOND
                words.append(
                    {
                        "word": chunk["text"],
                        "f0": round(offset * fps),
                        "f1": round((offset + duration) * fps),
                    }
                )

    # Audio chunks carry no timestamps in edge-tts 7.x; probe the saved file instead.
    total_seconds = probe_duration(mp3_path)
    if total_seconds <= 0 and words:
        total_seconds = words[-1]["f1"] / fps

    total_frames = round(total_seconds * fps)
    data = {
        "text": text,
        "voice": voice,
        "fps": fps,
        "seconds": round(total_seconds, 3),
        "totalFrames": total_frames,
        "words": words,
    }
    json_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def probe_duration(path: pathlib.Path) -> float:
    """File duration in seconds via ffprobe (0.0 if unavailable)."""
    import subprocess

    try:
        out = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True,
            text=True,
            check=True,
        )
        return float(out.stdout.strip())
    except Exception:
        return 0.0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a narration line with word timings.")
    parser.add_argument("--text", required=True, help="The line to speak")
    parser.add_argument("--out", required=True, help="Output base path, e.g. public/voice/line-01")
    parser.add_argument("--voice", default="en-US-AndrewNeural", help="edge-tts voice name")
    parser.add_argument("--fps", type=int, default=30, help="Project fps for frame timings")
    parser.add_argument("--rate", default=None, help='Speaking rate, e.g. "-4%%" or "+10%%"')
    args = parser.parse_args()

    data = asyncio.run(generate(args.text, args.out, args.voice, args.fps, args.rate))
    print(f'{data["seconds"]}s, {data["totalFrames"]} frames, {len(data["words"])} words -> {args.out}.mp3 + .words.json')
    return 0


if __name__ == "__main__":
    sys.exit(main())
