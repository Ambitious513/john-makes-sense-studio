# Pilot shot list — what is generated, what is code

The pilot is the DAY 1 + DAY 2 slice we already locked (480 frames, 16.0 s at
30 fps), wrapped with a hook, title card and outro. Splitting it by producer is
the decision that makes it fast, so here it is shot by shot.

**The headline: only 5 shots need generation.** Everything else is code, and the
code layers are what sit *on top* of the generated plates — that is the whole
point of the split, not a compromise.

---

## Generated hero shots (image-to-video)

| # | beat | frames | what happens | why it must be generated |
|---|---|---|---|---|
| G1 | 1.1–1.2 | 0–96 | lying on the couch, phone above face, thumb scrolling, tired | weight, hand micro-motion, the half-lidded face |
| G2 | 1.5 | 150–234 | the reaction as the voice whispers in his ear | a face acting — the money shot of DAY 1 |
| G3 | 2.1 | 240–270 | standing in the spotlight, headband on, resolve | posture carrying intent |
| G4 | 2.2 | 270–324 | the approach walk to the ball | walking is exactly the complex motion we conceded |
| G5 | 2.4–2.5 | 400–470 | the kick and follow-through | full-body dynamics, no chance in code |

### Generation brief format (fill this in `params.json` for every take)

```json
{
  "producer": "i2v",
  "generated": {
    "model": "<which model you used>",
    "prompt": "<the exact prompt>",
    "sourceImage": "assets/character/<established still>.png",
    "motionRef": "out/previz/G4-walk.mp4",
    "seed": "<if the model takes one>",
    "take": 3
  }
}
```

Three rules that will save you weeks:

1. **One source image, reused for every shot.** Pick the single best on-model
   still of the character and condition every generation on it. Consistency
   across the episode comes from that file, not from prompt discipline.
2. **Generate the shot longer than you need.** A 6 s generation trimmed to 3 s
   gives you the good middle and room for the cut.
3. **Ask for the background flat and matching our set**, or ask for a plain /
   transparent-ish backdrop and put our code set behind it. The cut between a
   generated hero and a code world is where this pipeline will fail if we ignore
   it — see the CUT gate in `docs/architecture.md` §4.

### Code previz, free to generate right now

For G1, G4 and G5 I can render a previz clip from the rig today — same timing,
same blocking, correct stride. It costs nothing and it means you generate once
against a reference instead of guessing durations:

```
npx remotion render src/index.ts StreetWalk out/previz/G4-walk.mp4
```

---

## Code shots (no generation, no cost, re-renderable by number)

| # | beat | frames | what it is |
|---|---|---|---|
| C1 | 1.3 | 96–150 | notification bubbles popping beside the phone |
| C2 | 1.4 | 60–190 | the Entity rising and growing behind the couch |
| C3 | 2.3 | 324–400 | the stance: hands on hips, smirk down at the ball |
| C4 | 2.5 | 411–471 | **the ball's flight** — arc, spin, motion trail, speed lines |
| C5 | 2.6 | 470–480 | resolve hold |
| C6 | all | — | DAY titles, HUD screen-time counter, captions, stat cards |
| C7 | 0–8 | — | hook card + title card for the pilot wrapper |

C4 is the clearest argument for this architecture: a ball arcing across a
background **is** motion graphics. Code does it in one line, frame-accurate to
the kick, and it can be re-timed when the VO changes. Generating that would be
slower, costlier and less precise.

---

## What I need from you to start

1. **Which image-to-video model do you have access to?** The pipeline is
   model-agnostic, but the prompt format, whether it takes a motion reference,
   and whether it can do first/last-frame conditioning all change the brief I
   write. Tell me the model and I'll write the prompts to its grammar.
2. **The character still.** The sheet you gave me is a 5-pose sheet — good for
   identity, wrong for conditioning a video model, which wants ONE figure in ONE
   pose. Do you have (or can you generate) a single full-body still of him in
   the neutral standing pose? That becomes `assets/character/hero.png` and the
   source image for every shot.

## What I'll do meanwhile, no answers needed

1. Render the previz clips for G1, G4, G5 so you have timing references.
2. Build the pilot wrapper in code: hook (0–8 s), title card, outro/CTA — the
   parts that are pure motion graphics.
3. Wire the identity gate to run on extracted frames of a generated clip, so the
   first time you hand me a take I can tell you in numbers whether it is still
   our character.
4. Build the composite slot: `<OffthreadVideo>` layer under the HUD/captions with
   the code set behind it, so a generated plate drops straight into the timeline.

Nothing here needs another architecture debate. The next real artefact is a
generated G4 walk and the code layers on top of it.
