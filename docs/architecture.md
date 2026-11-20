# Architecture — John Makes Sense Studio

**Status: decided.** This is the contract the pipeline runs on. It exists so
that no future tool forces a re-architecture: every engine is a *producer*
that conforms to a seam, and the assembler only reads the seams.

See `SKILL.md` for the day-to-day production manual; this file is the
architecture only.

---

## 1. Principles

1. **The hero's performance is generated; the hero's identity is measured.**
   Complex character motion and acting come from an image-to-video model, because
   code's proven ceiling is *geometry* (stance-lock, silhouette, palette) and
   geometry was never the missing thing — performance was. Code still owns the
   character's **consistency**: the sheet is the oracle, and the rig + measurement
   tools are what check every generated take against it.
2. **Every shot is an asset with a contract.** A shot is a folder with
   `params.json` + a rendered picture + gate JSON. The assembler reads the
   contract, never the producer. This is what made the swap below cheap rather
   than a rebuild: an i2v clip is just another producer.
3. **The edit lives in the timeline IR, not in a manual NLE.** Cuts, pacing and
   layering are data, so they can be re-rendered by changing a number.
4. **Final output is code-driven.** Remotion composites the picture; FFmpeg
   mixes audio, normalises loudness, burns captions and encodes.
5. **Determinism where it is still ours.** A code-rendered pose is a pure
   function of `(rig, frame, fps)`. A generated clip is NOT deterministic — so
   it is versioned as a file with a recorded model/prompt/seed in `params.json`,
   and the gate is the identity check, not a re-render.

---

## 2. The four seams

### 2.1 Shot asset contract

```
episodes/<episodeId>/shots/<shotId>/
  params.json          # the IR entry: module/clip, rig, timing, tokens, seed
  render.mp4           # the picture — produced by Remotion OR a DCC export
  gates/
    geometry.json      # MAE / IoU / palette purity (see §4)
    motion.json        # foot-slip, pops, loop seam
    av.json            # loudness, peak, black frames, duration
```

`params.json` is the single source of truth for *what* the shot is; `render.mp4`
is *how it was made*. The assembler never inspects the producer. Types:
`src/engine/contract.ts`.

**Producer rule:** any tool — Remotion, an image-to-video model, a DCC, a
hand-drawn export — may write a shot asset. If it cannot write the contract, it
does not enter the render path. A generated shot's `params.json` MUST record
`model`, `prompt`, `seed`, `sourceImage` and `take`, because a generated clip
cannot be re-rendered from a number — it can only be re-generated and re-gated.

### 2.2 Timeline IR

The edit is data. Two forms already exist and are unified by this contract:

| Form | Where | Use |
|---|---|---|
| `Timeline` / `Seg` | `src/engine/episode.tsx` | shot-based episodes (adapted from what-if-animation) |
| `DayBeat` / `heroSeq` | `src/episodes/slices/DayArcSlice.tsx` | the beat-driven "one day" scene pattern |

A **beat** resolves to one or more **shots**; a shot has `startFrame`,
`endFrame`, a `layer`, and a reference to its asset. The IR is the only place
the creative edit is authored.

### 2.3 Assembly split

| Stage | Tool | Responsibility |
|---|---|---|
| Visual compositing | **Remotion** | hero + world + effects + HUD + captions, in one deterministic timeline |
| Audio / delivery | **FFmpeg** (scripted) | VO + music + SFX mix, `loudnorm=I=-14:TP=-2`, caption burn, encode — see `tools/final_mix.py` |

DCC-rendered clips enter Remotion as `<OffthreadVideo>` layers — a one-line
import, not a pipeline link.

### 2.4 Layer policy

Revised 2026-11-20 after the pilot decision. The old rule ("hero = code, always")
optimised for editability; the cost was performance quality, which is the thing
the channel is actually judged on.

| Layer | Tool | Why |
|---|---|---|
| **Hero — acting, emotion, complex motion** | **image-to-video model** | code's ceiling is geometry; weight and intent are not keyable by a rig we can build in reasonable time |
| **Hero — simple, held, or graphic poses** | code rig | when a shot is really a silhouette or a pose card, code is faster and free |
| **Identity control across takes** | code rig + measurement | the sheet is the oracle; consistency is now a *gate*, not a renderer |
| **World** — backgrounds, environments, sets | **code** | deterministic, reusable, palette-disciplined |
| **Motion graphics** — HUD, captions, titles, stat cards, overlays | **code** | this is where code is simply the best tool that exists |
| **Effects** — particles, impacts, transitions | code or generated, per shot | whichever is cheaper at the cut |
| **Creative edit** | the timeline IR | compounding — never a manual NLE |

**The cut is the risk.** A generated hero over a code-rendered world will read as
two different media unless the generated plate is asked for the same flat palette,
line weight and lighting as the set. Every generated shot is therefore composited
and checked at the boundary, not just at the character.

### 2.5 The generated-shot workflow

```
1. storyboard beat
2. code previz  -> a 2-4 s rig animation of the beat (gait + poses). Cheap,
                   deterministic, and it fixes timing BEFORE paying for generation.
3. generation   -> source image (the sheet / an established still) + motion
                   reference (the previz) + prompt, recorded in params.json
4. take review  -> watch it; the only judge of performance is a human
5. identity gate-> tools/measure_sheet_fidelity.py on extracted frames: does the
                   take still look like OUR character?
6. composite    -> Remotion places the clip under the HUD/captions/set layers
7. delivery     -> FFmpeg mix + loudnorm + caption burn
```

Steps 2 and 5 are why the rig work was not wasted: it became the previz and the
quality control instead of the renderer.

---

## 3. Tool policy (decided)

| Tool | Role |
|---|---|
| Remotion | renderer (visual compositing: world, motion graphics, overlays, timing) |
| **Image-to-video model** | **hero performance** — acting, emotion, complex motion |
| StickGuy / SweaterGuy rigs + `gait.ts` | previz, graphic poses, and the identity oracle for generated takes |
| FFmpeg | final audio mix, loudness, captions, encode |
| Stride (`2d character`) | **lab** — prototype mechanics; not productionised |
| video2d | **measurement patterns** — fidelity gate, reference-oracle fitting |
| Friction / Synfig / OpenToonz / Pencil2D | world/effects clips on demand; no longer the hero's path |
| svgdotjs (`svgdom`) | possible QA utility (headless SVG measurement) |
| anime.js | **not adopted** — redundant with Remotion's frame model |
| OpenCut | **watchlist** — headless / Editor API / MCP roadmap |
| Kdenlive / MLT | **watchlist** — manual NLE, or scripted MLT as a future creative layer |

**Adding a tool later:** it must be either (a) a producer that writes the shot
asset contract, or (b) a layer that conforms to §2.4. Otherwise it stays out of
the render path.

**Model choice is deliberately open.** Several models are capable and the field
moves monthly; the pipeline above is model-agnostic because the contract is the
clip plus its `params.json`, not the vendor.

---

## 4. Verification (gates)

Every shot asset carries gate JSON; a shot without gates is not DONE.

Gates split by producer now, because a generated clip cannot be re-rendered from
a number — it can only be measured and re-generated.

**Every hero shot, whichever producer:**

- **Identity (the primary gate):** silhouette IoU ≥ 0.80 against the character
  sheet on extracted frames, width-profile MAE reported (`tools/measure_sheet_fidelity.py`).
  This is what catches the model drifting into a different-looking person.
- **Palette:** costume colours within ΔE 4 of the sheet tokens. Looser than the
  old code-render floor of ΔE 2 — generated pixels will not be flat fills, and
  chasing it would reject every take.
- **Cut:** the boundary between a generated hero and a code world is inspected at
  the frame edge: line weight, lighting direction, grain. A shot can pass identity
  and still fail the cut.
- **AV:** loudness −14 LUFS ±1 (a dense mix — a bare SFX bed cannot reach it, see
  `tools/final_mix.py`), true peak ≤ −1 dBTP, no black frames, duration matches IR
  ±1 frame, audio offset < 40 ms.

**Code-rendered shots only** (these no longer apply to generated hero clips):

- **Geometry / Motion:** planted-foot slip < 0.5 px/frame measured **through the
  render chain, not the analytic model** — the analytic test passed for months
  while the drawn pixels skated 5 u/frame (`src/characters/SweaterGuy/gait.test.ts`,
  `tools/measure_render_slip.py`).
- **Identity slot:** a costume slot may not enter the eye band
  (`tools/measure_headslot.py`). A covered pupil is not a style choice.

**Performance is not gated.** Weight, intent and acting quality are judged by a
human watching the take. No metric in this repo measures them, and pretending
otherwise is how we lost time.

---

## 5. Non-goals

- No manual NLE as the assembler.
- No per-frame traced cels as the hero.
- No code-rigged hero for complex acting — that was the old rule and it is
  retired; code keeps the world, the graphics and the character's *consistency*.
- No generated shot without its `params.json` provenance (model, prompt, seed,
  source image, take). An unrecorded take cannot be reproduced or compared.
