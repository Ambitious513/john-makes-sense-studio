// ============================================================
// ROOT.TSX — Registers all video compositions with Remotion
// ============================================================
import { Composition } from 'remotion';
import { loadFont as loadChewy } from '@remotion/google-fonts/Chewy';
import { loadFont as loadPatrickHand } from '@remotion/google-fonts/PatrickHand';

// Bundle the two reference fonts locally (no network at render time)
loadChewy();
loadPatrickHand();

import { OverthinkerVideo } from './episodes/overthinker/OverthinkerVideo';
import { QuitLustVideo, TOTAL } from './episodes/quit-lust/QuitLustVideo';
import { StickFigurePreview, PREVIEW_DURATION } from './episodes/previews/StickFigurePreview';
import { EntityPreview, ENTITY_PREVIEW_DURATION } from './episodes/previews/EntityPreview';
import { SetKitPreview, SETKIT_PREVIEW_DURATION } from './episodes/previews/SetKitPreview';
import { OverlaysPreview, OVERLAYS_PREVIEW_DURATION } from './episodes/previews/OverlaysPreview';
import { HudPreview, HUD_PREVIEW_DURATION } from './episodes/previews/HudPreview';
import { DayArcSlice, DEMO_BEATS, dayArcFrames } from './episodes/slices/DayArcSlice';
import { StreetWalk, DURATION as STREET_WALK_DURATION } from './episodes/street/StreetWalk';
import { Pilot20, DURATION as PILOT20_DURATION } from './episodes/pilot20/Pilot20';
import { PilotGenerated, DURATION as PILOT_GENERATED_DURATION } from './episodes/pilot20/PilotGenerated';

// Canvas spec
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        VIDEO 1: "What Happens When You Stop Overthinking for 30 Days"
        FORMAT: Voice Animation
        Duration: ~4.5 min = 8100 frames @ 30fps
      */}
      <Composition
        id="OverthinkerVideo"
        component={OverthinkerVideo}
        durationInFrames={8100}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        SHOT-FOR-SHOT RECREATION:
        "What Happens When You Quit Lust For 30 Days" (reference study)
        1280x720, 261.15s, synced to the reference voice+SFX track
      */}
      <Composition
        id="QuitLustRecreation"
        component={QuitLustVideo}
        durationInFrames={TOTAL}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{}}
      />

      {/*
        STICKGUY RIG PREVIEW — full character showcase:
        15 animation clips + 7 emotion faces + 5 pose presets
      */}
      <Composition
        id="StickFigurePreview"
        component={StickFigurePreview}
        durationInFrames={PREVIEW_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        ENTITY PREVIEW — the silhouette antagonist:
        4 staging states + the size-arc role reversal
      */}
      <Composition
        id="EntityPreview"
        component={EntityPreview}
        durationInFrames={ENTITY_PREVIEW_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        SET KIT PREVIEW — void room, lights, clocks, furniture, costume slots
      */}
      <Composition
        id="SetKitPreview"
        component={SetKitPreview}
        durationInFrames={SETKIT_PREVIEW_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        OVERLAYS PREVIEW — speed lines, impact flash, notifications,
        day titles, stat cards, wavy underline
      */}
      <Composition
        id="OverlaysPreview"
        component={OverlaysPreview}
        durationInFrames={OVERLAYS_PREVIEW_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        HUD PREVIEW — the screen-time counter:
        tick arc, day-reset jumps, corner placements
      */}
      <Composition
        id="HudPreview"
        component={HudPreview}
        durationInFrames={HUD_PREVIEW_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        STREET WALK — the sheet character (SweaterGuy) walking a sidewalk.
        Tests the whole engine at once: measured rig fidelity, stance-locked
        gait, parallax set, and audio cues on real heel strikes.
      */}
      <Composition
        id="StreetWalk"
        component={StreetWalk}
        durationInFrames={STREET_WALK_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        DAY ARC SLICE — the integration scene: one "day" beat pattern
        wiring characters + set kit + overlays + HUD + SFX.
        Demo = two days (low point → payoff).
      */}
      <Composition
        id="DayArcSlice"
        component={DayArcSlice}
        durationInFrames={dayArcFrames(DEMO_BEATS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ beats: DEMO_BEATS }}
      />

      {/*
        PILOT 20 s �?" timing-locked previz for the Flow (Omni) test.
        Three framings, generated VO, keyword cards. The generated clips drop
        into SHOTS[].plate without moving a single frame of the cut.
      */}
      <Composition
        id="Pilot20"
        component={Pilot20}
        durationInFrames={PILOT20_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
        AS-IS CUT -- the Flow clips play at native speed, untouched. The rig is
        not in this composition; code only supplies narration and graphics.
      */}
      <Composition
        id="PilotGenerated"
        component={PilotGenerated}
        durationInFrames={PILOT_GENERATED_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

// Need the React import
import React from 'react';
