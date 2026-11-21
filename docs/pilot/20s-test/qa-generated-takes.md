# QA — first Flow (Omni) takes, 2026-11-21

**Verdict: all three takes are REJECTED. The model replaced the character.**

The three clips in `psychology-channel/public/generated/pilot20/` were measured,
not eyeballed. Numbers below come from `tools/measure_generated_take.py` run on
six extracted frames per clip; the side-by-side is
`psychology-channel/out/pilot20/generated-check/verdict-sheet.png`; the unedited
11.6 s reel of what Flow produced is
`psychology-channel/out/pilot20/generated-check/flow-raw-reel.mp4`.

## What came back

| | s1 (wide) | s2 (medium) | s3 (close) |
|---|---|---|---|
| Resolution / fps | 1280×720 / 24 | 1280×720 / 24 | 1280×720 / 24 |
| Duration | 4.03 s (96 f) | 3.54 s (85 f) | 4.03 s (96 f) |
| Native audio | −39.6 dB mean | −46.9 dB mean | −27.9 dB mean |
| Provenance `params.json` | **missing** | **missing** | **missing** |

Two consequences before we even discuss identity:

1. The cut needs 4.4 / 7.8 / 7.8 s. The clips supply 4.03 / 3.54 / 4.03 s —
   Flow returned ~4 s clips, not the 8 s we planned around. S2 and S3 would need
   a 2.2× hold or a re-cut. We did **not** pad them: holding a failing frame
   longer does not make it pass.
2. Flow's native audio is 14–25 dB below our narration and carries no usable
   performance. Our own VO and mix stay.

## Identity measurements

Reference (measured from the supplied sheet): hair dark-fraction **0.79**,
sweater median **#536272** (matches the token #546172), body aspect **0.313**.

| Clip | Hair | Sweater | ΔE (limit 4) | Body aspect | Max box drift |
|---|---|---|---|---|---|
| s1 | 0.13–0.15 | #454239–#47453B | **20.7–21.2** | 0.44–0.55 | 71 px |
| s2 | 0.04–0.20 | #454438–#47463A | **21.6–22.1** | 0.44–0.58 | 62 px |
| s3 | 0.16–0.22 | #434436–#454637 | **22.2–23.3** | 0.51–0.52 | 2.5 px |

Every frame fails all three identity gates. In plain terms:

- **The hair is gone.** Hair coverage is 0.13–0.22 against 0.79 — the model drew
  a bald, pale, older head where the sheet has a black fluffy fringe.
- **The sweater is the wrong colour by 5× the tolerance.** Olive/brown
  `#454239` instead of navy `#536272`; ΔE 21–23 against a limit of 4.
- **The body is too stocky.** Aspect 0.44–0.58 against 0.313.
- **S1's camera is not locked** despite the prompt: the figure's box moves up to
  71 px between sampled frames.
- **S3 is a full-body wide shot**, not the requested 85 mm close-up. Late frames
  also add rectangular glasses that are not in the sheet.
- The environment is a detailed 3D-perspective street; the sheet and our world
  are flat 2D. The cut between the two would fail on style even if the face passed.

This is not "a bit of drift to prompt away". Every take fails the same three
measurements, which means the model did not bind to the supplied character at all.

## What this means

The storyboard's decision table says: if none pass, the flat line-art style is
outside what the model can hold — stop spending credits and change the art
direction, not the prompts. That conclusion is **provisional for one reason**:
the clips look consistent with text-only generation. The character description
in the text ("short fluffy dark hair #393F47", "navy turtleneck #546172") was
ignored in every take, which is what happens when no reference image is attached.

**One question decides the next move:** was `sheet-a.jpg` (or a crop of it)
actually attached in Flow as a reference/ingredient/first-frame image for these
generations, or were the text prompts used alone?

## The one-clip retry (cheap, decisive)

I prepared a clean first frame from the sheet:
`psychology-channel/public/generated/pilot20/source-from-sheet.png` — one full
figure on cream paper, no labels, 1280×720.

Use it as the **first frame / ingredient**, and type **only motion**, with no
character description at all:

> He breathes slowly and blinks twice. His raised hand lowers gently to his
> pocket. Camera locked. Keep the exact same drawing, face, hair, clothes and
> line weight as the first frame. No new details, no text, no camera move.

Generate **one** clip and send it. Then:

- Hair ≥ 0.45 of the sheet's (≥ 0.36), sweater ΔE ≤ 4, body aspect within 25 %
  → the model can hold the character when bound to an image; rebuild the shot
  list around image-first generation.
- Any fail → the flat line-art style cannot be held by this model. Freeze the
  generated-hero path, keep the code world + a different hero producer, and
  stop spending credits on this look.

Either answer is worth one 4-second generation. A second round of longer text
prompts is not: the text was already ignored.

## Files

- `tools/measure_generated_take.py` — the gate used above; reusable on any take.
- `out/pilot20/generated-check/verdict-sheet.png` — previz vs generated, 3 shots.
- `out/pilot20/generated-check/flow-raw-reel.mp4` — raw Flow output, 11.6 s.
- `out/pilot20/Pilot20.previz.mp4` — the timing-locked 20 s code cut (still the
  only deliverable that passes the gates).
