// The architecture contract — the seams every producer and the assembler agree on.
// See docs/architecture.md. Keep this module small: it is the *contract*, not
// the implementation.

/** What a shot draws. The hero's performance is generated; the world is code. */
export type LayerKind = 'hero' | 'world' | 'effect' | 'prop' | 'overlay';

/** Who produced a shot's picture. The assembler never branches on this. */
export type Producer = 'remotion' | 'i2v' | 'dcc' | 'import';

export interface ShotRender {
  kind: 'mp4' | 'frames';
  path: string;
  fps: number;
  width: number;
  height: number;
}

/**
 * Provenance for a generated shot. A code shot can be rebuilt from a number; a
 * generated clip cannot, so the take is only reproducible (and only comparable
 * against other takes) if all of this is recorded. An unrecorded take is not a
 * valid asset.
 */
export interface GeneratedProvenance {
  model: string;
  prompt: string;
  /** the character image the model was conditioned on */
  sourceImage: string;
  /** optional motion reference — usually a code previz clip of the same beat */
  motionRef?: string;
  seed?: number | string;
  /** which attempt this is, so takes can be compared on the identity gate */
  take: number;
}

export interface ShotAsset {
  id: string;
  episodeId: string;
  /** the IR entry: module/clip, rig, timing, tokens, seed */
  params: Record<string, unknown>;
  /** the picture — produced by Remotion OR a generated/DCC export */
  render: ShotRender;
  gates?: {
    geometry?: string;
    motion?: string;
    av?: string;
    /** silhouette IoU + palette ΔE vs the character sheet — the primary hero gate */
    identity?: string;
  };
  producer: Producer;
  /** required when producer is 'i2v' */
  generated?: GeneratedProvenance;
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
