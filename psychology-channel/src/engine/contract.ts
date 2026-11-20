// The architecture contract — the seams every producer and the assembler agree on.
// See docs/architecture.md. Keep this module small: it is the *contract*, not
// the implementation.

/** What a shot draws. The hero is always code; the rest may be any producer. */
export type LayerKind = 'hero' | 'world' | 'effect' | 'prop' | 'overlay';

/** Who produced a shot's picture. The assembler never branches on this. */
export type Producer = 'remotion' | 'dcc' | 'import';

export interface ShotRender {
  kind: 'mp4' | 'frames';
  path: string;
  fps: number;
  width: number;
  height: number;
}

export interface ShotAsset {
  id: string;
  episodeId: string;
  /** the IR entry: module/clip, rig, timing, tokens, seed */
  params: Record<string, unknown>;
  /** the picture — produced by Remotion OR a DCC export */
  render: ShotRender;
  gates?: {
    geometry?: string;
    motion?: string;
    av?: string;
  };
  producer: Producer;
}

/** One shot on the timeline: a stretch of an asset at a layer. */
export interface TimelineShot {
  id: string;
  asset: string;
  startFrame: number;
  endFrame: number;
  layer: LayerKind;
}

export interface TimelineIR {
  fps: number;
  total: number;
  shots: TimelineShot[];
  audio: { voice?: string; music?: string; sfx?: string };
}
