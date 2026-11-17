---
name: coded-character-rig
description: >
  How to build, extend, and skin reusable code-drawn 2D characters (SVG/React) for Remotion
  in this workspace — using the StickGuy rig system in psychology-channel as the reference
  implementation. Use when asked to create a new character, add animation clips, add
  expressions, attach props, add lip-sync, or build a new Remotion character from an image
  or character sheet.
---

# Code-Drawn Character Rig System

The workspace has one proven, reusable character engine. This document is the manual for
generating characters with it — and for building more systems like it later.

Reference implementation:

```text
psychology-channel/src/characters/StickGuy/
├── types.ts        # the contract: Pose channels + Palette + component props
├── rig.ts          # pivots (RIG), default poses, palettes, visemes, math helpers
├── StickGuy.tsx    # the SVG renderer (pure, no state, no DOM mutation)
├── animations.ts   # deterministic animation clips + lip-sync helpers
├── index.ts        # barrel export
└── lineart/        # optional extras: gait solver, ink primitives, springs
                     (adapted from github.com/JDhruv14/line-art-animation, MIT)
```

Shared machinery lives beside it:

```text
psychology-channel/src/engine/     # episode engine, lighting kit, SFX registry, voice engine
psychology-channel/src/episodes/   # one folder per video; private characters live there
psychology-channel/public/sfx/     # curated sound library (registry: engine/sfx.tsx)
psychology-channel/public/voice/   # TTS lines + word timings (generator: tools/tts.py)
```

---

## 1. The non-negotiable rules

1. **Everything is code.** No image assets, no sprites, no fonts inside the character.
   Pure SVG built from React elements. Crisp at any resolution.
2. **Every joint is a number.** If a value is in the `Pose`, it is animatable. If a body
   part exists in the SVG, it hangs off a named pivot in `RIG`.
3. **Deterministic only.** A frame number + fps must fully define the picture.
   - No `Math.random()` (use `random()` from Remotion, or `hash01(n)` / engine `rnd(seed, i)`).
   - No `requestAnimationFrame`, no wall-clock time, no state carried between frames.
   - No imperative DOM mutation. Render is a pure function.
4. **Flat style.** Solid fills, one ink color, no gradients inside the character.
   Rounded caps and joins. Clean silhouette reads at 200px and at 4K.
5. **Verify before declaring done.** `npx tsc --noEmit` + `npx eslint src` must both be
   clean, the character must render in a preview composition, and a final MP4 render must
   be watched before delivery.

---

## 2. The four layers (and what belongs in each)

### Layer 1 — `types.ts`: the contract
Define three things:

- **`Pose`** — every animatable channel, with units and ranges in comments:
  - root: `x`, `y`, `scale`, `lean` (deg, around hips), `squash` (1 = neutral)
  - head: `headTilt`, `headTurn` (-1..1 fake 3/4 turn), `headBob`
  - face: `eyeOpen`, `lookX`, `lookY`, `browRaise`, `browTilt`, `mouthOpen`, `mouthSmile`, `mouthWidth`
  - arms: `armL/R` (0 = T-pose, 90 = down), `elbowL/R`, `wristL/R`
  - legs: `legL/R`, `kneeL/R`, `footL/R`
- **`Palette`** — every colorable part as its own key (ink, skin, skinShade, shirt, pants,
  glove, shoe, sole, lid, mouth, tongue, shadow). Never hard-code hex in the renderer.
- **`Props`** — `pose?: Partial<Pose>`, `palette?: Partial<Palette>`, `strokeWidth`,
  `shadow`, `debug`, `viewBox`, `handSlotL/R?: ReactNode`, `background?: ReactNode`.
  Everything optional, everything mergeable over defaults.

### Layer 2 — `rig.ts`: pivots, defaults, helpers
- **`RIG`** — the coordinate table: every pivot's position in character space
  (head center, neck, shoulders, elbows, wrists, hips, knees, ankles, eye/mouth anchors).
  The renderer and prop attach points both read from this. Do not scatter magic numbers.
- **Rest poses**: `T_POSE` (all zeros — the reference frame) and `IDLE_POSE`
  (arms at rest, legs slightly apart, neutral face).
- **Math helpers**: `clamp`, `lerp`, `mixPose(a, b, t)` (channel-wise cross-fade),
  `resolvePose(partial, base)` (fills a `Partial<Pose>` over defaults).
- **`VISEMES`** — mouth shapes as `{ mouthOpen, mouthSmile, mouthWidth }` triples keyed by
  viseme (rest, M, A, E, I, O, U, F, L, W).
- **`DEFAULT_PALETTE`** + one or more named palettes (e.g. black-and-white variant).
- `DEFAULT_VIEWBOX` (room for jumps/raised arms) and a tighter one.

#### Rig sign conventions (calibrated against renders — trust these)
- **arm**: 74 ≈ hanging down; 0 = T-pose; negative = raised up.
- **elbow**: positive folds the forearm down/in-across (60/100 = hands meet in front —
  phone hold; 40/140 = arms crossed tight — hug); negative folds the forearm up (wave).
- **knee**: positive folds the shin OUTWARD (frog squat — wrong for sitting); negative
  folds the shins INWARD (folded under / crossed — all sitting poses use negative).
- Sitting poses drop the root with `y: 96–250` and fold knees negative; legs render
  BEHIND the torso, so knees-up partially hides behind the body.
- **Doom stare** = eyeOpen 0.26 + lookY 0.55 (0.12 reads sleepy-sad, not dead).
- **Hollow stare** = eyeOpen 0.7 + pupil 0.55 (wide + pupil 0.42 reads "shocked").
- Props in `handSlotR` are x-flipped on screen (right arm group is mirrored,
  `scale(-1 1)`) and render UNDER the forearm — offset props upward to peek over gloves.

### Layer 3 — `StickGuy.tsx`: the renderer
One pure component `<StickGuy pose palette ... />` that:

1. Reads pivots from `RIG`, resolves the pose over defaults.
2. Computes joint positions with 2-bone forward kinematics (rotate segment A from the
   shoulder/hip, segment B from elbow/knee by the bend angle).
3. Draws in a fixed **paint order**: far limbs → torso → near limbs → head, so a turned
   body overlaps itself correctly. Exception: an arm whose hand overlaps the head circle
   (waved / raised) is re-painted AFTER the head so the hand never hides behind the skull
   (`armOverHead` FK test).
4. Groups each attach point (`handSlotL/R`) inside the hand's transform so props follow.
5. Clips eyes/mouth with `<clipPath>` (unique id via `useId()` — multiple characters on
   screen must not collide).
6. Optionally renders `debug` joints and rig guides.

Style rules for the renderer: solid fills from the palette, one stroke weight from
`strokeWidth`, rounded caps/joins, shading only as a second solid tone (`skinShade`),
never a gradient.

### Layer 4 — `animations.ts`: clips and lip-sync
- Each clip is a **pure function of `(frame, fps, options?)`** returning a
  `Partial<Pose>`: `ANIMATIONS.id.fn(frame, fps, { amplitude, speed, seed, base, blink })`.
- Register clips in `ANIMATIONS: Record<AnimationId, { id, duration, loops, fn }>` and mirror in
  `ANIMATION_LIST` for UI cycling. Existing set: tpose, idle, wave, walk, run, talk,
  jump (one-shot), dance, shrug, point, **slouch, huddle, sit-edge, slump, resolve** (acting).
- Lipsync: `textToVisemes(text, fps)` builds a track; `visemeAt(track, frame, blend)`
  samples it into mouth values. For **real narration audio**, prefer the engine's
  `useVoiceMouth()` (word timings from `tools/tts.py`) — see §5.
- NOTE: Day One Films characters **never talk on screen** — narration is voiceover or
  text+SFX. The `talk` clip exists only as a rig tool; use the acting clips for emotion.

### Layer 4b — `faces.ts`: emotion faces (the acting layer)Seven faces as *partial poses* that spread over ANY body pose or clip — faces and body
are independent layers, never baked together:

```tsx
import { FACES } from '../characters/StickGuy/faces';

const p = ANIMATIONS.idle.fn(frame, fps);
<StickGuy pose={{ ...p, ...FACES.doom }} />            // doomscrolling while idle
<StickGuy pose={{ ...ANIMATIONS.slouch.fn(f, fps) }} /> // slouch has doom face baked in
```

| Face | Read | Key params |
|------|------|-----------|
| `neutral` | rig baseline | `{}` |
| `doom` | dead-eyed doomscroll stare | eyeOpen 0.26, lookY 0.55 |
| `grit` | angry V-brows + clenched teeth | browBend 1, teeth 1 |
| `hollow` | 2 AM insomnia stare (heavy lids, small pupils) | eyeOpen 0.7, pupil 0.55 |
| `soft` | calm payoff smile | mouthSmile 0.8 |
| `worried` | tempted/anxious, sweat drop | browTilt -8, sweat 1 |
| `shocked` | realisation beat, mouth agape | browRaise 9, mouthOpen 0.8 |

To animate INTO a face, blend with `mixPose` over a resolved base (see §5 recipes).

Face renderer params: `pupil` (scale, 0.42 = tiny hollow), `teeth` (clenched band inside
open mouth), `sweat` (temple drop), `browBend` (0 = neutral arc, 1 = angry V — rotation
alone cannot make an angry brow; use bend).

---

## 3. How to make a new character

### Path A — reskin (same rig, new palette)
For a character with the same body plan, different colors/details:

```tsx
import { StickGuy, ANIMATIONS } from '../characters/StickGuy';

<StickGuy
  pose={ANIMATIONS.idle.fn(frame, fps)}
  palette={{ shirt: '#D94F70', pants: '#27344A', shoe: '#111111' }}
/>
```

Add a named palette to `rig.ts` if it will be reused. Optionally add a small extra piece
(hat, glasses) behind `handSlotR`/`background` — no geometry changes needed.

### Path B — new geometry, same contract
For a genuinely different body plan (robot, child, creature):

1. Create `src/characters/<Name>/` with the same four-layer layout.
2. Copy `types.ts` as the **contract** (keep channel names; it is what lets clips be
   reused across characters). Add character-specific channels only if a feature needs
   independent motion (`tailAngle`, `antennaBend`, `hairSwing`...).
3. Rebuild `RIG` for the new proportions (head size, limb lengths, torso shape).
4. Rewrite the renderer's SVG bodies — reuse the same paint order, clip-path hygiene,
   and palette discipline.
5. Port or import the clips: procedural clips can often be copied unchanged if the
   channel names match; locomotion should use the gait solver (`characters/StickGuy/lineart/gait.ts`)
   so feet plant instead of sine-sliding.
6. Export from `index.ts`, then follow §4 to verify.

### Path C — from an image / character sheet
1. Study the sheet: silhouette, proportions (head-to-body ratio), face construction,
   clothing shapes, palette, distinctive details (hair, accessories, props).
2. Write the layer plan in comments first: what hangs off which pivot.
3. Measure proportions in units — pick a rig box (StickGuy uses 690×700) and place
   hips at a fixed anchor; everything else derives from `RIG`.
4. Build layers back-to-front in the renderer; verify each part in `debug` mode
   (`<StickGuy pose={T_POSE} debug />`) before animating.
5. Match the palette to the sheet, converted to flat 2–3 tone fills per part.

---

## 3b. The Entity — second cast member (`src/characters/Entity/`)

The shared antagonist: a pure-black silhouette with red slit eyes (`#E8392F`), a thin
red smile (tempting only), and a soft red aura. **No detail, no mouth movement — it is
a shape, and its SIZE is the emotion** (role-reversal arc: starts huge, shrinks as the
hero grows — see `docs/reference-style-study.md` §2).

- Same rig box as StickGuy (690×700, ground 672) so `scale 1` = hero height; ~2.6 =
  dominating, ~0.16 = palm-size. Channels: `x y scale lean headTilt armSpread cower
  eyeOpen smile glow rim` (`types.ts` has the contract + `resolveEntityPose`).
- Four state presets in `states.ts`: `tempting` (hero-sized lean, smile), `dominating`
  (2.6x, arms spread), `mirror` (dead calm, no smile), `shrunken` (cowering ember).
  Clips: `loom` (breathing idle), `tempt`, `cower` (tremble), `spread` (slow block).
- Renderer: body/head/arms are merged black shapes with an optional faint red rim
  (`rim`); the aura is a radial-gradient *light* (gradients allowed for light sources
  only); eye slits = blur-glow copy + crisp copy. NOTE the cower hunch squashes the
  body around the ground and swings the arms inward.
- **Preview staging gotchas** (each cost a render round):
  - Never size the SVG box by a scale AND set `pose.scale` — they multiply. In
    compositions, size the box and keep `pose.scale: 1` (or vice versa).
  - At `armSpread > ~1.1` the raised arms swing up behind the giant head and vanish
    (arms paint behind the body plane). Dominating uses 1.05 = horizontal bar.
  - Tiny (`<0.4`) states need an expanded viewBox (e.g. `-240 -280 1170 1240`) or the
    aura gets clipped to the box and the figure reads as nothing.
  - Shrunken staging per the study: cowering **in the corner**, hero centre-frame.

---

## 3c. The set kit — prop department (`src/characters/SetKit/SetKit.tsx`)

Void-world staging furniture (study §4). House rules baked into every prop:

- **Palette**: dark fills `#15191F` / `#10141A` + soft cream edges
  `rgba(242,234,216,0.55)` (sharp) / `0.30` (soft). Red `#E8392F` only where it
  means temptation/urgency (LED digits). Void `#0d0d0d`.
- **Every prop viewBox's bottom edge sits ON the ground line** — position with
  `position:absolute; bottom:<groundFrac>%` and it lands correctly.
- **Gradient ids use `useId()`** (`uid` + suffix) — multiple instances of a prop
  in one frame must not collide.
- Light cones (SpotlightCone, DeskLamp, phone glow) are the ONLY gradients.

Props: `VoidRoom` (ground line field, `groundFrac` default 0.22, optional
`wallFrac`), `SpotlightCone` (% space, isolates the figure), `LedClock`
(`time` string, `blink` needs `frame` — colon ticks every 15 frames),
`WallClock` (`h m`, hands only), `DeskLamp` (`on`), `Couch` (`tint`),
`Dresser`, `CrackedMirror` (`crack` 0..1, `reflection` slot — put the Entity
there), `SoccerBall`.

**Costume slots** (authored in StickGuy head space — head centre 345,92 r 82):
`RedHeadband` (resolve/discipline — shallow arc across the FOREHEAD,
`M 269,74 Q 345,46 421,74`, not an over-the-skull arc) and `RedBeanie` (the
kid). Pass through `<StickGuy headSlot={...}>` — the slot renders inside the
head group and follows head tilt.

Staging: furniture slightly darker than the character reads "background";
keep one light source per scene; clocks are the only props that tell time.

---

## 3d. Overlays — graphic department (`src/characters/Overlays/Overlays.tsx`)

Screen-space overlays from study §1 + §4. Every component reads its own
`useCurrentFrame()` and takes a `from` frame (pure + seekable):

- `SpeedLines` — montage streaks; `color` (yellow `#FFD84D` for the DISCIPLINE
  inversion burst), `count`, `direction`, `speed`, `seed`.
- `ImpactFlash` — 2-frame white-out spike that decays (`from`, `peak` 0.92,
  `decay` ~9 frames). Drop at the exact impact frame; renders nothing before.
- `NotificationBubble` / `NotificationCluster` — SOFT BLUE ONLY (`#7FB8E8`
  digital rule), back-ease pop-in, app glyph + text + "4m" age stamp; cluster
  pops bubbles beat-by-beat (`stagger`).
- `DayTitle` — three placement variants, pick ONE per video and stay
  consistent (study §1): `top-left` small caps (DISCIPLINE), `top-center`
  large Chewy (QuitLust), `bottom-right` caps (PhoneKillingYou HUD pairing).
- `StatCard` — data beat: giant value + caps label, emphasis through SCALE
  (`size` knob) never color; `red` variant only for urgency words.
- `WavyUnderline` — hand-drawn red stroke that draws itself in
  (stroke-dash trick); title-card grammar = giant Chewy word + this + a cream
  line whose final word turns red.

Preview cells must FIT the 1080 frame: header + 3 rows needs rows ≤340/290/270
tall — an overflowing preview silently clips the bottom row in renders.

---

## 3e. HUD counter — `ScreenTimeHud` (in Overlays.tsx)

The addiction arc quantified (study §4 item 6): `SCREEN TIME TODAY 0h 06m →
9h 17m` ticking frame by frame, like PhoneKillingYou.

- The value comes from `screenTimeMinutes(frame, fps, from, startMinutes,
  schedule)` — a PURE function driven by a `HudTick[]` schedule, so scenes,
  charts and the HUD read the SAME number. Per-frame increment =
  `perSecond / fps` (minutes per frame). Segments: `{ frames, perSecond,
  jumpTo }` — omit `perSecond` to HOLD, set `jumpTo` for the day-reset beat
  (blackout → `0h 06m` again, pair with `<DayTitle variant="top-center">`).
- `formatScreenTime(minutes)` → `9h 17m` (zero-padded minutes).
- `ScreenTimeHud` renders: grey caps mono label + big bold mono value,
  `corner` prop (top-left default / top-right / bottom-left / bottom-right),
  `alarmAt` turns the value RED with a glow past the threshold (urgency rule),
  fade-in over `fadeIn` frames from `from`.
- Rate sanity for a 300-frame cell: drift ≈1–2/s, spiral ≈100–130/s reaches
  ~9h 17m in 130 frames (8.4 + 127·130/30 ≈ 557 min). The overthinker
  episode's local `ScreenTimeCounter` (startFrame→endFrame lerp) stays for
  that episode; new work should use the schedule API.

---

## 3f. DayArcSlice — the "one day" scene pattern (`src/episodes/slices/DayArcSlice.tsx`)

THE integration layer: declarative `DayBeat`s composed into sequences —
blackout → DAY title → scene → Entity whisper / notifications → blackout →
next day. Episodes describe beats; the slice renders staging, overlays, HUD
and auto-SFX. Demo beats in `DEMO_BEATS` (low point → payoff), composition
`DayArcSlice`.

- `DayBeat`: `{ label, frames, hero, heroSeq, headSlot, set:
  'couch'|'spotlight'|'empty', screenTime, entity: {mode, say, sayFrom,
  growTo, growSeconds}, notifications: {from, stagger, anchor, items},
  ball, pushIn, speedLinesFrom, narration, sfx }`.
- `heroSeq` is a clip TIMELINE: `[{from, clip, x?, layout?, phone?}]` —
  the box glides from the previous step's x to the step's x over ~26
  frames; one-shot clips (`kick`, `jump`, `loops: false`) hold their end
  pose. `layout: 'lounge'` switches to the wide lying box.
- Auto-cues per beat: whoosh-short at f0 (blackout), thud at f14 (pose
  lands), one `notification` cue per bubble, swoosh-fast/impact/
  light-energy wired to `ball.kickAt`. Beat-local frames via `<Sequence>`
  — pass extra cues beat-local.

### v2 staging numbers (verified against out/storyboard/01-06.jpg)

- `lounge` (lying face-up, head screen-RIGHT): `lean: 90` rotates the
  whole rig around the hips; T-pose-class arms become "up" in world
  space. Mirror symmetry BREAKS while lying — for both hands up use
  `armL ≈ -20, armR ≈ 160 + armL` (i.e. −160), `elbowR = -elbowL`,
  `kneeL/R ≈ +8` folds the shins flat (NEGATIVE knee folds them up).
  Box: 620×342, viewBox `'10 140 780 430'`, bottom `calc(22% + 25px)`,
  hero x ≈ 37.5% (head lands at the right armrest ≈ x1270px).
- Phone while lying goes in `handSlotL` (unmirrored, predictable
  offsets), `translate(31 -48)` in the wrist frame puts it between both
  hands above the face. Notifications anchor at `{left:'54%',
  top:'38%'}` — right beside the raised hand.
- Entity GROW: do NOT enlarge via a custom viewBox — the blurred aura
  clips into a hard rectangle at the SVG edge. Render the Entity at its
  DEFAULT viewBox (300×344) and drive the size with a CSS
  `transform: scale(g)` on the wrapper, `transformOrigin: '50% 88%'`,
  div bottom `calc(22% - 41px)` (the internal ground line sits ~41px
  above the div bottom because the viewBox is vertically centered).
  growTo ≈ 2.0 crests the couch back; `lean -20` after the ramp drops
  the head onto the hero's ear. Whisper text at `left 55%, top 50%`.
- Ball choreography: `ball: { at: 'calc(x% + Npx)', kickAt, fly:
  {dx, dy, frames, arc} }` — flight = ease-out position + sin arc lift +
  `-10°/frame` spin; SpeedLines burst via `speedLinesFrom: kickAt`;
  ImpactFlash `peak 0.22` (0.5 washes the whole frame gray).
- Ball ground-plane calibration (PIL-verified): the SoccerBall circle is
  inset 8/120 in its div, so `bottom: calc(GROUND - 4px)` puts it exactly
  ON the drawn ground line. NOTE `calc(GROUND - Npx)` moves an element
  DOWN; use `+` to raise. `at: 'calc(38% + 57px)'` centers the ball under
  ballRest's sole (sole spans scaled x 765–812, center 788).
- `ballRest` clip (panel 5, foot planted on the ball, hands akimbo,
  locked): with the ball ON the ground line its visible top sits at rig
  y ≈ 575 → ankle (194, 533) → `kneeL -62, footL -62, legL 0`. RULE: a
  child foot inherits the shin's rotation (`leg - knee`), so
  **footL = kneeL levels the sole**. Akimbo arms read only when the
  elbow clears the torso edge: `armL/R 20, elbowL/R 90, wrist -10`.
  Sniff pose: `lookX -0.25, lookY 0.3, eyeOpen 0.42, browTilt -2,
  mouthSmile 0.5` (smirk down at the ball).
- `kick` clip (panel 6, locked): `lean K(-1,-12,18,14,2)` — lean pivots
  at (345,420) and CARRIES the arms, so strike lean >18° rotates the
  raised fist INTO the head. `legL K(4,-12,75,45,22)` (75 ≈ 45° above
  horizontal), support crouch `kneeR K(-4,-12,-22,-14,-4)`, left fist up
  `armL K(66,40,-25,-22,52)` / sharp fold `elbowL K(6,-25,-95,-88,10)`
  (glove grazes the head edge — accepted), right arm back-down
  `armR K(66,45,22,26,45)`, `lookX/lookY` track the ball.
- Headband streaming tails: `RedHeadband` takes `stream` (0–1) — two
  ribbons peel off the knot and stream right. The slice computes
  `headbandStream` = `min(1, local/10)` during `kick`, relaxing over
  24f when `resolve` follows `kick`. Ball flight draws a motion trail
  (white gradient streak rotated `atan2(-dy,-dx)`, length 24+150·u,
  opacity 0.75·u) OUTSIDE the spin div.
- DAY 2 timing (locked): resolve(0) → walk(30) → ballRest(84) →
  kick(160) → resolve(230) — the resolve is delayed past the flight so
  the follow-through holds. `kickAt: 171, speedLinesFrom: 171` (kick
  contact ≈ kick.from + 13f = 173; launching at 171 reads as foot and
  ball leaving together). `screenTime: { startMinutes: 7, perSecond:
  0.3, alarmAt: 7 }` → red LED-style HUD per panel 5. Auto-sfx at
  `kickAt - 4 / kickAt / +14` (swoosh-fast/impact/light-energy).
- Hero kicks with the LEFT leg so the ball flies UPPER-LEFT, matching
  the shot. Sign conventions (empirical): armR/armL negative = raised;
  `legL` positive swings the leg UP-left; SVG rotate(+) = clockwise.

### Entity arm transform gotcha (found by the slice)

The ARM path is authored near the SVG origin. It must be **translated to
the shoulder FIRST, then rotated around the local origin**
(`translate(SHOULDER) rotate(a)`) — `rotate(a SHOULDER)` on an origin-path
leaves the arms floating at the rig edges. And with that correct transform,
**left-arm outward spread = clockwise = POSITIVE angle**:
`armAngle = armSpread*100 − cower*62`. (The old inverted sign was masked
because the floating arms rotated into plausible-looking positions.)
Also: the `tempt` clip writes its own armSpread — clamp/override AFTER
calling the clip, not in the base pose.

---

## 4. Verification workflow (always)

```bash
npx tsc --noEmit        # zero errors required
npx eslint src          # zero problems required
npm run dev             # Remotion studio; check the preview composition live
```

1. Register a preview composition for the character in `src/Root.tsx`
   (see `src/episodes/previews/StickFigurePreview.tsx` for the pattern:
   cycle clips, then hold pose presets).
2. Render a check: `npx remotion render <CompId> out/<name>.mp4` — watch it.
   Confirm: no console errors, no flicker, proportions hold during motion,
   mouth/eye clipping correct at extremes.

---

## 5. Putting a character in a scene (the full stack)

```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { StickGuy, ANIMATIONS, mixPose, IDLE_POSE } from '../characters/StickGuy';
import { useVoiceMouth, VoiceLine, SfxLayer } from '../engine';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const { mouth } = useVoiceMouth('voice/line-01.words.json');

<>
  <VoiceLine src="voice/line-01.mp3" />
  <StickGuy
    pose={{ ...ANIMATIONS.talk.fn(frame, fps), ...(mouth ?? {}) }}
    handSlotR={<Sign text="Day 1" />}
  />
  <SfxLayer cues={[{ f: 30, sfx: 'whoosh' }]} />
</>
```

Generate the narration first:

```powershell
.venv\Scripts\python.exe tools\tts.py --text "..." --out public\voice\line-01
```

For episodes with cuts, use the engine's `defineEpisode()` timeline system
(`src/engine/episode.tsx`): shots are pure functions of their own clock, and the edit
can hold, replay, or reverse them.

---

## 6. Extension recipes

| Want to... | Do this |
|---|---|
| Add a clip | New pure `fn(frame, fps, opts)` in `animations.ts`; register in `ANIMATIONS` + `AnimationId` |
| Add an expression | New entry in `VISEMES`-style shape tables; or compose via `browRaise/browTilt/mouthSmile` channels |
| Better walk/run | Use `lineart/gait.ts` (planted-foot solver); map its joints onto `Pose` leg/arm channels |
| Attach a prop | Pass it to `handSlotL`/`handSlotR`; keep prop-local geometry centered on the wrist pivot |
| New palette/variant | Named palette in `rig.ts`; swap per scene |
| Pose cross-fade | `mixPose(poseA, poseB, t)` with an ease on `t` |
| Atmosphere/light | `engine/kit.tsx` (rim filters, skies, rays, shafts); apply a `rimR`/`rimBlue` filter id to the character group |
| Sound on action | `SfxLayer` cue at the action's frame; durations in the registry prevent overlap |

## 7. Anti-patterns (these have all caused real bugs elsewhere)

- `Math.random()` in render → flickering renders. Use Remotion `random()` / `hash01`.
- Layout-affecting React state in the character → frame impurity. Pose in, SVG out.
- Hard-coded colors in the renderer → palettes become impossible later.
- Skip-layer shortcuts (renderer knows about clips, clips know about SVG ids) →
  a second character can't reuse anything.
- Trusting `duration` labels over rendered output — always watch the MP4.

## 8. Production QA & timing rules (cherry-picked from mromidev/claude-animated-shorts, MIT)

Reference clone lives at `vendor/claude-animated-shorts/` — for *method only*. Its style
(2D characters in a painted 3D world, vertical) is a different channel; never apply its
look values or reference frames to Day One work.

### Timing rules that transfer directly
- **Every visual reaction lands 0–3 frames BEFORE its word** in the narration track.
  Never on or after the word.
- **Flat holds read as freezes.** Any static hold ≥ ~12 frames needs a creeping push-in
  (~0.15–0.35 %/frame, a touch more on punch words). Applies to the void world too.
- Hard cuts only on big jumps; everything else glides (18–40 frame smootherstep).
- Impact shakes: flip sign every frame, decay over ~7 frames.

### Automated frame QA — `tools/qa_video.py`
After every full render: `python tools/qa_video.py <video.mp4> out/<name>/qa [shots.json]`.
It reports specs/loudness/silences, detects black/white frames, unplanned pops
(frame-diff spikes > 3x local median), frozen spans ≥ 12 f, and writes contact sheets
(60 frames each, frame numbers burned in) plus a `report.md`. Pass a `shots.json`
(`{"shots":[{"id":1,"a":0,"b":130}], "flash":[...], "xfade":[[a,b]]}`) so planned cuts,
flashes and crossfades are not flagged. **Preview/showcase compositions legitimately
"fail"** (hard cuts at section boundaries, static presets) — read the report with that
in mind; the tool is for episode renders.

### Side-by-side style verification — `tools/sbs_sheet.py`
`python tools/sbs_sheet.py out.jpg --ours f1.png f2.png --ref ref1.png ref2.png`
builds an ours-vs-reference comparison sheet from our extracted reference frames
(`VIDEO REFERENCES/`) — use it for look checks, same spirit as §4 verification.

### Remotion operational gotchas (learned the hard way, from the same repo)
- Every Remotion render copies `public/` into a `remotion-webpack-bundle-*` folder in
  the system temp dir and never deletes it — GBs accumulate. If renders start dying
  with ENOSPC, point `TEMP`/`TMP` at a big drive or clean old bundle folders.
- Remotion writes a silent audio track into renders: mux external audio with
  `-map 0:v:0 -map 1:a:0`.
- Scratch `.ts` files inside `out/` break `npx tsc --noEmit` — name them `.txt`.
- Film grain multiplies file size (~4x) and turns to mush on YouTube; our flat style
  doesn't want it anyway.
