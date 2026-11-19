# DAY ARC SLICE v2 — Shot Plan (rebuilt per user notes)

**STATUS: BUILT & RENDERED — panels 1–6 MATCH** — `out/DayArcSlice.mp4`,
QA clean (`python tools/qa_video.py`: no unplanned pops/frozen spans;
pops at 232 (day-1 blackout whip) and 411–418 (kick contact + launch +
flash) are planned action). Staging numbers documented in SKILL.md §3f.

Method: `vendor/claude-animated-shorts` pipeline (§8) — beat plan → storyboard
images (`out/storyboard/`) → build → still loop → render → `tools/qa_video.py`.

User fixes driving v2:
1. Hero lies ON THE COUCH, face up, phone above his face, texting — not sitting
   slumped with a phone lost in his lap. Notifications pop NEXT TO THE PHONE.
2. The Entity starts SMALL behind the couch armrest, GROWS while he texts, and
   whispers in his ear at the temptation peak — not standing beside the couch.
3. He actually KICKS the ball — not standing next to a ball parked far away.

## Beat 1 — "DAY 1 · the couch wins" (240 frames @30fps)

| # | frames (beat-local) | shot | staging | SFX |
|---|---|---|---|---|
| 1.1 | 0–30 | establish wide | blackout lifts → couch, hero LYING face-up, phone above face, blue glow, HUD 0h 06m | whoosh-short f0, thud f14 |
| 1.2 | 30–96 | texting hold | thumb presses the screen (micro arm pulse); slow push-in (§8 rule: no static hold ≥12f) | typing f40 vol 0.35 |
| 1.3 | 96–150 | notifications | bubbles pop NEXT TO the phone, one per pop, phone-buzz each; hero unaffected | notification f98/f112/f126 |
| 1.4 | 60–190 | THE GROW | entity rises from behind the RIGHT armrest: scale 0.35 → 1.35 one-shot ramp, eyes over the couch back at f150 | riser-tension f150 vol 0.4 |
| 1.5 | 150–234 | whisper at ear | entity leans over the couch back, face at the hero's ear, red "just one sec." floats f160; hero thumb slows | suspense f160 vol 0.5 |
| 1.6 | 234–240 | blackout | fade to black; HUD holds | — |

## Beat 2 — "DAY 2 · the couch loses" (240 frames; panels 05–06)

Locked heroSeq: `resolve(0) → walk(30) → ballRest(84) → kick(160) →
resolve(230)`; push-in from f26 @ 0.0024/frame; HUD red at 0h 07m
(`alarmAt: 7`).

| # | frames | shot | staging | SFX |
|---|---|---|---|---|
| 2.1 | 0–30 | establish (panel 5 mood) | blackout lifts → spotlight cone, hero standing resolve + red headband, ball parked nearby, HUD 0h 07m, shrunken entity far corner | whoosh-short f0, thud f14 |
| 2.2 | 30–84 | approach | stance-locked walk-in to the ball (box travels 26% → 38% over 54f, IK gait at matched speed — planted soles, no skate) | footsteps-wood f40 vol 0.4 |
| 2.3 | 84–160 | THE STANCE (panel 5) | ballRest: LEFT foot planted ON the ball crown (sole bottom y = ball top y, PIL-verified), hands akimbo, smirk down at the ball, determined breathing loop; ball at `calc(38% + 57px)`, bottom `GROUND − 4px` | — |
| 2.4 | 160–230 | THE KICK (panel 6) | kick one-shot: windup (lean −12, knee −96) → strike ≈ f173 (lean +18, legL 75 ≈ 45° up-left, left fist up beside head, right arm back-down, support knee crouch) → follow-through held through the whole flight; headband tails stream (ramp local/10) | swoosh-fast f167, impact f171, light-energy f185 |
| 2.5 | 171–231 | flight | ball launches at kickAt 171 (2f before deepest contact — foot and ball leave together): ease-out flight dx −430 dy −470 over 60f, sin arc +90, −10°/f spin, white motion trail streak; speed-lines burst f171–f201; impact flash f171 | — |
| 2.6 | 230–234 | payoff | resolve stance snaps in as the ball exits (tails relax over 24f) | — |
| 2.7 | 234–240 | blackout | — | — |

Global frames: beat 2 starts at 240 (kick contact = global 413, launch =
global 411, flight end ≈ global 471).

## New engine pieces required

1. `lounge` hero clip (animations.ts): lying face-up — container rotate −90°
   around the figure + pose: knees slightly bent, both arms up holding phone
   (arm ≈ −30, elbow ≈ −70), thumb-press micro pulse on the beat. Head level
   with the phone.
2. `grow` entity clip (states.ts): one-shot scale ramp 0.35 → 1.35 (easeInOut,
   ~4.5s) over loom; position anchored so the head crests the couch back.
3. `ballRest` hero clip (animations.ts): foot planted on the ball, hands
   akimbo, smirk — the pre-kick confidence beat (panel 5). Rule learned:
   `footL = kneeL` levels the sole (the child foot inherits the shin's
   rotation `leg − knee`).
4. `kick` hero clip (animations.ts): anticipation → strike → follow-through
   one-shot (~1.15s) using the leg channels; ball animates from foot along an
   arc (parabola + spin, hand-plotted in the beat, not a clip). Strike lean
   ≤ 18° — the lean pivots at (345,420) and carries the arms.
5. Notification cluster anchored to the phone position (beat-local coords).
