// The Oli inside the island: a box that draws one symbol of the page sprite. Changing the pose is
// changing the <use> href, the same markup on the server and after hydration (DECISOES § 44). She is
// decorative (aria-hidden): the state is always said in text next to her.
import type { Pose } from '../../oli/poses.ts';

/** All the poses this island can show: the page puts them in its sprite (BaseLayout `oli`). */
export const PANEL_POSES: Pose[] = ['wave', 'gulp', 'swim', 'cheer', 'oops'];

export default function Oli({ pose, class: className }: { pose: Pose; class: string }) {
  return (
    <div class={className} data-oli={pose} aria-hidden="true">
      <svg aria-hidden="true">
        <use href={`#oli-${pose}`} />
      </svg>
    </div>
  );
}
