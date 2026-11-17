# Psychology Channel — Code-Drawn Character Style

Project-specific guidance inspired by code-drawn line-art and explainer animation techniques.
This is an original project note, not a copy of an external style prompt or demo.

## Visual language

- Use pure SVG/React geometry for reusable characters.
- Prefer a warm off-white or neutral paper background.
- Use near-black ink for outlines and one accent color per scene.
- Keep colors flat: no gradients, unnecessary shadows, or decorative effects.
- Use rounded caps and joins on expressive strokes.
- Keep body proportions and line weight consistent across characters.
- Use curved limb paths when the design calls for hand-drawn or ink-like motion.
- Preserve clean silhouettes at both 720p and 4K output.

## Character construction

- Every character is a collection of named, independently animatable parts.
- The head rotates around the neck pivot; it must never visually detach.
- Arms and legs use explicit shoulder, elbow, wrist, hip, knee, and ankle pivots.
- Hide overlapping limb seams where appropriate so the character does not look assembled from disconnected pieces.
- Add character-specific rig channels only when a feature needs independent motion.
- Props attach to hand or body slots instead of being positioned by unrelated screen coordinates.

## Motion quality

- Every animation is a pure function of Remotion's current frame and composition FPS.
- Never use unseeded randomness, wall-clock time, requestAnimationFrame, or mutable cross-frame state in rendered components.
- Use anticipation, action, overshoot, and settle for meaningful gestures.
- Use spring-like follow-through for hands, forearms, clothing, hair, and props.
- Use planted-foot gait solving for walk and run cycles; do not rely on simple sine-wave bobbing alone.
- Keep feet planted during stance phases and solve knees from hip/ankle positions.
- Offset related body parts so the head, torso, arms, and props do not move in perfect unison.
- On twos or stepped motion, step only the intended character action; keep camera and lighting smooth.

## Scene composition

- Treat the character as part of the explanation, not as decoration.
- Prefer one visual idea per shot.
- Let actions communicate the point instead of repeating the action in text.
- Use camera movement and scale changes instead of slide-deck-like page transitions.
- Keep important subjects inside the title-safe area.
- Use an accent color for one semantic purpose per scene: source, path, warning, or result.
- For connected characters, draw a continuous hand-to-hand path rather than two lines that merely touch.

## Remotion implementation rules

- Use `useCurrentFrame()` and `useVideoConfig()` for all rendered animation.
- Keep timeline data in one source of truth.
- Use SVG viewBox coordinates and world-to-screen transforms consistently.
- Export reusable components with typed pose and palette interfaces.
- Add debug pivots, bounding boxes, and ground guides to new rigs.
- Preview a single character before building a full scene.
- Render an MP4 and inspect representative frames before delivery.

## Current project architecture

- `src/characters/StickGuy/StickGuy.tsx`: reusable SVG character renderer.
- `src/characters/StickGuy/rig.ts`: pivots, pose defaults, palettes, visemes, helpers.
- `src/characters/StickGuy/animations.ts`: deterministic animation clips and lip-sync helpers.
- `src/characters/StickGuy/lineart/`: selected line-art primitives, gait solver, and motion utilities.
- `src/engine/`: shot-based episode engine (timeline, shots, looks, FX, storyboard), an atmosphere kit
  (rim lights, skies, rays, light shafts, haze, bokeh, film grain), SFX registry/player, and the voice engine
  (edge-tts narration + word timings). Adapted under MIT from `github.com/kelano86/what-if-animation`;
  the Python voice/SFX pipeline, room sets, props, and the example cast were not installed.
- `src/episodes/`: one folder per video — `overthinker/` (video + its private characters, UI, tokens, motion),
  `quit-lust/` (theme, kit, actors, props, scenes), and `previews/` (character showcase compositions).
- `src/episodes/previews/StickFigurePreview.tsx`: rendered character showcase.

## Excluded from this project

Do not add the external repository's full plugin, 99-style library, gallery, demo films,
Python environment, TTS/Whisper stack, music tools, HTML capture pipeline, or third-party
assets unless a future request explicitly requires one of those capabilities.
