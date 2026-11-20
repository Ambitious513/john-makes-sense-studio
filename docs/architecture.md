# Architecture — John Makes Sense Studio

**Status: decided.** This is the contract the pipeline runs on. It exists so
that no future tool forces a re-architecture: every engine is a *producer*
that conforms to a seam, and the assembler only reads the seams.

See `SKILL.md` for the day-to-day production manual; this file is the
architecture only.

---

## 1. Principles

1. **One engine for the character — code.** The hero (face, emotion, acting,
   walk/run) is always rendered from the StickGuy rig in Remotion. This is the
   distinctive thing; it is never baked into a video by another tool.
2. **Every shot is an asset with a contract.** A shot is a folder with
   `params.json` + a rendered picture + gate JSON. The assembler reads the
   contract, never the producer.
3. **The edit lives in the timeline IR, not in a manual NLE.** Cuts, pacing and
   layering are data, so they can be re-rendered by changing a number.
4. **Final output is code-driven.** Remotion composites the picture; FFmpeg
   mixes audio, normalises loudness, burns captions and encodes.
5. **Determinism.** A pose is a pure function of `(rig, frame, fps)`. No
   `Math.random`, no `Date.now`, no timers in the render path.

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

**Producer rule:** any tool — Remotion, Friction, Synfig, a hand-drawn export —
may write a shot asset. If it cannot write the contract, it does not enter the
render path.

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

| Layer | Tool | Why |
|---|---|---|
| **Hero** — face, emotion, acting, walk/run | **Code, always** | identity + editability live here |
| **World** — backgrounds, environments | any producer (code or DCC clip) | no identity risk; render once, reuse |
| **Effects** — particles, smoke, impacts, transitions | code or DCC clip | pick per shot |
| **Props / crowds / extras** | any producer | cheaper than modelling in code |
| **Complex hero action** (stunt, transformation) | **reference-fit (default)**, else code | keeps the hero in code; borrows motion from a reference |
| **Creative edit** | the timeline IR | compounding — never a manual NLE |

---

## 3. Tool policy (decided)

| Tool | Role |
|---|---|
| Remotion | renderer (visual compositing) |
| StickGuy rig + `gait.ts` | character engine |
| FFmpeg | final audio mix, loudness, captions, encode |
| Stride (`2d character`) | **lab** — prototype mechanics; not productionised |
| video2d | **measurement patterns** — fidelity gate, reference-oracle fitting |
| Friction / Synfig / OpenToonz / Pencil2D | motion donor + world/effects clips, on demand |
| svgdotjs (`svgdom`) | possible QA utility (headless SVG measurement) |
| anime.js | **not adopted** — redundant with Remotion's frame model |
| OpenCut | **watchlist** — headless / Editor API / MCP roadmap |
| Kdenlive / MLT | **watchlist** — manual NLE, or scripted MLT as a future creative layer |

**Adding a tool later:** it must be either (a) a producer that writes the shot
asset contract, or (b) a layer that conforms to §2.4. Otherwise it stays out of
the render path.

---

## 4. Verification (gates)

Every shot asset carries gate JSON; a shot without gates is not DONE.

- **Geometry:** MAE / silhouette IoU vs reference (when one exists), palette
  purity ≥ 99.5% within ΔE 2 of tokens. State the error floor — do not chase 0.
- **Motion:** planted-foot slip < 0.5 px/frame (see
  `src/characters/StickGuy/gait.test.ts`), no pops > 3× local median, loop seam
  within threshold.
- **AV:** loudness −14 LUFS ±1, true peak ≤ −1 dBTP, no black frames, duration
  matches IR ±1 frame, audio offset < 40 ms.

---

## 5. Non-goals

- No DCC in the render path for the hero.
- No manual NLE as the assembler.
- No per-frame traced cels as the hero.
- No generative-model pixels as final frames.
