# PILOT 20 s — "Tired after doing nothing"

**Purpose:** find out what Google Flow (Omni 1.1 / 1.2, image-to-video) can actually
do with *this* character sheet, in one 20-second piece. Three shots, each one step
harder, so one viewing tells us where the model breaks.

**Source image:** `psychology-channel/out/look/sheet-a.jpg` (the five-pose sheet).
**Master:** 1920×1080, 30 fps, 600 frames, 20.00 s.

> **Result of the first generation round (2026-11-21): all three takes failed
> identity and were rejected.** See `qa-generated-takes.md` in this folder for
> the measurements. The prompts below are the record of what was sent, **not** a
> validated recipe — do not re-run them unchanged.

**Deliverables in this folder**

| File | What it is |
|---|---|
| this doc | storyboard, VO script, image prompts, motion prompts, gates |
| `psychology-channel/public/voice/pilot20-l{1,2,3}.mp3` | generated voiceover (edge-tts, `en-US-AndrewNeural`) |
| `psychology-channel/public/voice/pilot20-l{1,2,3}.words.json` | real word timings, for captions/visemes |
| `Pilot20` composition | timing-locked previz: camera, captions, VO, mix |

---

## 1. The idea (20 seconds)

He stands on a street doing nothing, all day. The narration reframes the tiredness:
it is not an empty battery, it is a prediction loop with nothing to confirm. The last
line turns it: rest is not the absence of work, it is the presence of a finish line.

Three beats, three framings, three difficulty tiers — wide (static body), medium
(turn + gesture), close (face acting). If the close-up survives, the model is usable
for this channel. If only the wide survives, we have a background/montage tool, not
a character tool.

---

## 2. Beat sheet (frame-exact @ 30 fps)

| Beat | Frames | Time | Shot | What happens |
|---|---|---|---|---|
| S1 | 0–132 | 0.00–4.40 | **WIDE**, eye level, 35 mm | He stands still, hands in pockets, shoulders down. Street behind him is alive; he is not. Slow 4 % push-in. |
| S2 | 132–366 | 4.40–12.20 | **MEDIUM**, chest height, 50 mm | He turns his head from the street to camera, one hand comes up palm-up in a small shrug, then drops. Push to 8 %. |
| S3 | 366–600 | 12.20–20.00 | **CLOSE**, eye level, 85 mm | Almost still. Blink, swallow, a small knowing nod and a half-smile on the last three words. Locked camera. |

### VO, measured (not estimated)

| Line | Frames | Seconds | Text |
|---|---|---|---|
| L1 | 10–99 | 2.95 | "You ever feel tired after doing nothing all day?" |
| L2 | 141–330 | 6.29 | "Your brain isn't a battery. It's a prediction machine, and with nothing to confirm, it loops." |
| L3 | 408–546 | 4.58 | "Rest isn't the absence of work. It's the presence of a finish line." |

Speech 13.82 s in 20.00 s. The 6.2 s of air is deliberate: it is where the cuts and
the face do the work. Note L3 starts 1.4 s after the cut to the close-up — the pause
is the turn.

### On-screen text (keyword cards only, never a full transcript)

| Card | Frames | Text |
|---|---|---|
| C1 | 16–124 | TIRED AFTER DOING NOTHING? |
| C2 | 300–356 | IT LOOPS. |
| C3 | 520–592 | A FINISH LINE. |

Persistent corner bug: `JOHN MAKES SENSE`, top-right, 55 % ink — it doubles as a
composite test over generated footage.

---

## 3. Image prompts (the stills you generate, then animate)

Two blocks are **verbatim** in all three prompts. Do not paraphrase them between
shots — that is how the costume drifts.

**STYLE BLOCK**

> Flat 2D hand-drawn illustration, even-weight black ink outlines, flat fills with a
> single soft shadow tone, no gradients on skin, no 3D shading, no photorealism, no
> painterly texture, subtle paper grain. Palette strictly: navy blue-grey turtleneck
> #546172, charcoal trousers #383F45, near-black shoes #1A1512, warm cream paper
> #FCF5EB, dusty blue-grey accents #B9C2CC. 16:9.

**CHARACTER BLOCK**

> A young man, late twenties, short fluffy dark hair #393F47 with soft peaks and a
> small cowlick, round face, simple dot eyes with thin arched brows, small triangular
> nose, gentle closed-mouth smile. Oversized navy turtleneck sweater with slightly
> long sleeves, straight-leg charcoal trousers, black slip-on shoes. Seven and a half
> heads tall, narrow shoulders, long legs.

### S1 — wide (the still the model must hold still)

> **[STYLE BLOCK]** **[CHARACTER BLOCK]** Wide establishing shot, full body, character
> standing still on a quiet city sidewalk in late afternoon, both hands in his sweater
> pockets, shoulders slightly slumped, head turned a little away from camera, tired
> posture, weight on his back leg. Background: simplified street in the same flat
> illustration — cream paper buildings, one lamp post, a low curb, empty pavement, one
> distant parked car, nothing else. Camera: eye level, 35 mm, character on the left
> third, plenty of negative space above him. Flat lighting, only a soft ellipse of
> shadow under his shoes. No text, no signs with letters, no letterboxing, no border,
> no extra people.

### S2 — medium (the turn)

> **[STYLE BLOCK]** **[CHARACTER BLOCK]** Medium shot, waist-up, three-quarter view:
> character turned slightly away from camera, head beginning to turn back toward it,
> his right hand raised palm-up at chest height in a small explaining gesture, left
> hand in his pocket, eyebrows slightly lifted. Background: the same street, a cream
> façade and the edge of a lamp post, simplified, no lettering. Camera: chest height,
> 50 mm, character right of centre. Flat lighting. No text, no extra people, no border.

### S3 — close (the real test)

> **[STYLE BLOCK]** **[CHARACTER BLOCK]** Close-up, head and shoulders, facing camera,
> tired but warm expression, a hint of a wry half-smile, eyes looking straight into the
> lens, brows relaxed. Background: soft out-of-focus cream wall with one large dusty
> blue-grey shape, nothing readable. Camera: 85 mm, eye level, shallow depth of field
> suggested with flat tone only. No text, no border, no extra people, no jewellery, no
> glasses.

### Consistency rules

1. Generate **S1 first**. Feed S1 into Flow as the reference/ingredient image for S2
   and S3 — never regenerate the character from text alone.
2. Every prompt keeps the STYLE and CHARACTER blocks byte-identical.
3. Reject a still before animating it if: sweater hue shifts, hair silhouette changes,
   sleeves lose their "slightly long" drape, a new object or lettering appears, or the
   line weight differs from the sheet at 100 % zoom.
4. Keep one aspect ratio (16:9) and one crop logic for all three, so the cuts feel like
   a camera and not like three different illustrations.

---

## 4. Motion prompts (what you type into Flow's animate box)

Flow's image-to-video treats the still as frame one. These describe **only motion and
camera**; the look is already in the still. Keep them short — long prompts invite the
model to invent.

### S1 (4.4 s needed; if the model only gives 8 s, generate 8 and trim the head)

> Subtle, near-still life: the man breathes, blinks twice, shifts his weight slowly from
> one leg to the other, the sweater collar moves slightly. Distant traffic passes behind
> him. Very slow 4 % push-in. His feet stay planted; he does not walk; his hands stay in
> his pockets. Keep the flat 2D illustration style exactly; no realism, no added detail,
> no camera shake, no new people.

### S2 (7.8 s)

> He turns his head from the street toward the camera over about one second, raises his
> right hand palm-up in a small shrug as his eyebrows lift, then lowers the hand back to
> his pocket. Slow 8 % push-in. Body stays planted, no walking, no walking-cycle. Keep the
> flat 2D illustration style exactly; same face, same sweater, no realism, no camera
> shake, no new people, no text.

### S3 (7.8 s)

> Almost still: he blinks, swallows, gives one small knowing nod and a slight half-smile on
> the last words, micro head movement only. Camera locked. Keep the flat 2D illustration
> style exactly; identical face, hair and sweater to the first frame; no realism, no
> morphing, no eye-colour change, no teeth showing, no new objects.

---

## 5. Workflow in Flow

1. Generate the three stills with the prompts above, S1 first, S2/S3 referenced to S1.
2. Animate each still with its motion prompt. Quality setting on, 1080p, 16:9.
3. Export the three clips as-is (no in-app trim, no filters) — we cut them here.
4. Drop them in `psychology-channel/public/generated/pilot20/` named
   `s1.mp4`, `s2.mp4`, `s3.mp4`, plus a `params.json` per clip recording model
   version, prompt, seed if shown, and take number. An unrecorded take cannot be
   compared later.
5. I extract 3 frames per clip and run the gates, then composite under the code HUD,
   captions and mix.

---

## 6. Gates (measured, per clip)

| Gate | Rule | Tool |
|---|---|---|
| Identity | silhouette IoU ≥ 0.80 vs the sheet | `tools/measure_sheet_fidelity.py` |
| Costume | palette ΔE ≤ 4 on sweater / trousers / hair | same tool |
| Stability | head-bbox centre < 1.5 px/frame drift, no limb swap | frame tracking (new, written when clips exist) |
| Style | no added detail, no lettering, line weight matches at 100 % zoom | eyeball at 100 %, one frame per shot |
| Cut | world/hero edge holds: no halo, no grain mismatch | inspect S1 first frame |

**Known gap:** the identity gate is built for full-body silhouettes. S3 is head and
shoulders, so it gets a head-only crop mode before we judge it — otherwise we would be
rejecting a close-up for not containing legs.

---

## 7. How to read the result

- **All three pass** → the model can carry the channel; the pilot becomes the
  production path and we scale to the shot list.
- **Wide and medium pass, close fails** → generated footage for establishing and
  B-roll, code/other methods for face acting. Still useful, different pipeline.
- **Only the wide passes** → the model is an environment/motion tool; the hero stays
  a solved problem elsewhere.
- **None pass** → the sheet's flat line-art style is outside what this model can hold;
  we stop spending credits and change the art direction, not the prompts.
