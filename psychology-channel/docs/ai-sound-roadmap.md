# AI Sound Generation — Open-Source Roadmap

Curated from an external agent report (GitHub survey, Nov 2026). These are bookmarked for
future use — **not installed**, because this workstation has an Intel Iris Xe GPU without
CUDA, and every serious generative-audio model below requires NVIDIA GPU inference.

Current production path: ElevenLabs API (SFX v3 + Music v2.5), scripted via
`tools/elevenlabs.py` / the ElevenLabs CLI. After the ElevenLabs plan ends, revisit this
list — the local stack becomes the free fallback if a CUDA GPU is available.

## Worth installing first (if we get a CUDA GPU)

| Project | What | Why here |
|---|---|---|
| [Soundbox](https://github.com/) | Local studio app bundling Stable Audio + ACE-Step for SFX/music/voice, timeline + API | Fastest hands-on path; agent-controllable |
| [LocalSoundsAPI](https://github.com/) | Portable REST audio studio (XTTS, Fish Speech, Stable Audio, ACE-Step) | Scriptable all-in-one |
| [AudioCraft (Meta)](https://github.com/facebookresearch/audiocraft) | MusicGen + AudioGen training/generation library | Research-grade foundation; fine-tuning path |
| [Stable Audio Open](https://github.com/Stability-AI/stable-audio-tools) | Open-weight text-to-audio | Core SFX generation |
| [AudioX-Turbo](https://github.com/) | Anything-to-audio, very fast | Batch SFX |
| [MOSS-SoundEffect](https://github.com/) | Text-to-sound, ambience/scenes up to 30s | Ambience beds |
| [Bark (Suno)](https://github.com/suno-ai/bark) | Speech + SFX + nonverbal from text | Voice-adjacent SFX (laughter etc.) |

## Reference / study (lower priority)

- **Amphion** — audio/music/speech toolkit, reproducible research
- **Higgs Audio V2** — audio foundation model (10M hours pretraining)
- **Jukebox (OpenAI)** — landmark raw-audio music model
- **Riffusion** — spectrogram-diffusion music generation
- **DiffMoog** — differentiable modular synth for sound matching
- **sonus** — Max/MSP algorithmic composition package
- **Neutone SDK** — PyTorch models as DAW plugins (VST/AU)

## Discovery lists

- backblaze-labs/awesome-audio-generation
- Yuan-ManX/audio-development-tools
- wildminder/awesome-ai-voice

## Practical notes

- Local generation economics: no per-credit cost, but slow on CPU and no CUDA here.
- ElevenLabs SFX: `POST /v1/sound-generation` — 0.5–30s, 40 credits/s when duration set,
  `loop: true` (v2 only) for seamless beds, model `eleven_text_to_sound_v3` preferred.
- ElevenLabs Music: `POST /v1/music` — prompt + `music_length_ms` (3s–600s),
  `force_instrumental`, model `music_v2_5`, paid plans only.
- Engine integration: generated files drop into `public/sfx/` / `public/music/` and are
  registered in `src/engine/sfx.tsx` (`SFX` map) — durations from ffprobe.
