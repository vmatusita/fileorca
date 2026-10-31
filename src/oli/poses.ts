// The nine Oli poses: a closed list (design system v1.1; a new pose needs a decision in DECISOES.md).
// Client-safe: no imports, so islands can use it too.
export const POSES = ['wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost', 'coffee', 'peek'] as const;

export type Pose = (typeof POSES)[number];

export function isPose(value: string): value is Pose {
  return (POSES as readonly string[]).includes(value);
}
