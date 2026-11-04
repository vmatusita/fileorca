// The ten Oli poses: a closed list (design system v1.1; a new pose needs a decision in DECISOES.md). F12 (DECISOES § 417):
// the tenth, sad, is only for the ad-block wall (PLANO-MELHORIAS, Mudança 12).
// Client-safe: no imports, so islands can use it too.
export const POSES = ['wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost', 'coffee', 'peek', 'sad'] as const;

export type Pose = (typeof POSES)[number];

/**
 * The pose of the ad-block wall, in one place: if Victor's reverse image search finds the sad pose too close to an existing
 * character, swapping it for oops is this one line (prompt F12, decision 6).
 */
export const WALL_POSE: Pose = 'sad';

export function isPose(value: string): value is Pose {
  return (POSES as readonly string[]).includes(value);
}
