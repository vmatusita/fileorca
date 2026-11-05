// FileCard (docs/design/components/FileCard): one file of a batch, with the folded corner in the
// category colour (DECISOES § 53). The arrow between the sizes is the arrow-right icon with "to" /
// "para" / "a" for screen readers (the fonts have no →). The batch downloads through the ResultCard;
// the row buttons are secondary and named after the file they hand out. F2 states: waiting (the
// queue works one file at a time), a neutral done row (conversions have no "gain"), a toggle that
// picks the file the comparison or the crop box shows, and a reason that may carry a link.
import type { ComponentChildren } from 'preact';
import Icon from '../icons/Icon.tsx';
import alertIcon from '../../docs/design/assets/Icons/alert.svg?raw';
import arrowIcon from '../../docs/design/assets/Icons/arrow-right.svg?raw';
import checkIcon from '../../docs/design/assets/Icons/check.svg?raw';
import closeIcon from '../../docs/design/assets/Icons/close.svg?raw';
import downloadIcon from '../../docs/design/assets/Icons/download.svg?raw';
import fileIcon from '../../docs/design/assets/Icons/file.svg?raw';
import trashIcon from '../../docs/design/assets/Icons/trash.svg?raw';

export interface FileCardLabels {
  /** Hidden word between the two sizes: "to" / "para" / "a". */
  to: string;
  /** "Download {name}" */
  download: string;
  /** "Cancel {name}" */
  cancel: string;
  /** "Remove {name}" */
  remove: string;
  /** "Show {name}": the toggle that picks this file for the comparison or the crop box. */
  select?: string;
}

export type FileCardProps = {
  name: string;
  category: 'image' | 'pdf';
  labels: FileCardLabels;
  /** Object URL of a thumbnail (never uploaded). */
  thumb?: string;
  /** The file the comparison or the crop box shows; only rows with `onSelect` are toggles. */
  selected?: boolean;
  onSelect?: () => void;
  /**
   * The place of the file in the order of the Merge list (F13a, UX-04 A; DECISOES § 479): a numbered circle in deep
   * (the ScenarioCompare pattern, aria-hidden: the list says "1 of 2") takes the place of the empty thumbnail.
   */
  order?: number;
  /**
   * Inner markup of an icon for the thumbnail of a file with no picture (F13a, F-6; DECISOES § 485): the PDF icon in
   * the category's soft colour instead of an empty square. The page hands it in (read at build), so the image chunk does
   * not carry it.
   */
  icon?: string;
} & (
  | {
      state: 'done';
      before: string;
      /** Size after; left out when the row has nothing to compare (the sizes of a PDF page say nothing). */
      after?: string;
      /** Compression gain with the check icon ("−68%"). */
      gain?: string;
      /** A neutral line instead of a gain: "Already optimized", "1280 × 720". */
      note?: string;
      /** Name of the file the download button hands out (the output name), when it differs from `name`. */
      downloadName?: string;
      /** Left out when the row has nothing to hand out (the page images of a PDF). */
      onDownload?: () => void;
    }
  | { state: 'waiting'; status: string; onCancel: () => void }
  | { state: 'working'; status: string; progress: number; onCancel: () => void }
  | { state: 'error'; reason: ComponentChildren; onRemove: () => void }
);

// A function as the replacement: a file name with "$&" or "$'" in it must not be read as a replacement pattern.
const named = (label: string, name: string) => label.replace('{name}', () => name);

export default function FileCard(props: FileCardProps) {
  const { name, category, labels, thumb, order, icon } = props;
  const picture =
    props.state === 'error' ? (
      <div class="fo-file__thumb">
        <Icon raw={fileIcon} />
      </div>
    ) : order !== undefined ? (
      <span class="fo-merge__n" aria-hidden="true">
        {order}
      </span>
    ) : thumb ? (
      <img class="fo-file__thumb" src={thumb} alt="" width={52} height={52} />
    ) : (
      <div class="fo-file__thumb">{icon !== undefined && <Icon inner={icon} />}</div>
    );
  return (
    <div
      class={`fo-file fo-dogear fo-cat--${category}`}
      data-state={props.state === 'error' ? 'error' : undefined}
      data-selected={props.selected ? 'true' : undefined}
    >
      {props.onSelect ? (
        <button type="button" class="fo-file__pick" aria-pressed={props.selected === true} aria-label={named(labels.select ?? 'Show {name}', name)} onClick={props.onSelect}>
          {picture}
        </button>
      ) : (
        picture
      )}
      <div>
        <p class="fo-file__name" title={name}>
          {name}
        </p>
        {props.state === 'done' && (
          <p class="fo-file__meta">
            <span>
              {props.before}
              {props.after !== undefined && (
                <>
                  {' '}
                  <Icon raw={arrowIcon} class="fo-icon--inline" />
                  <span class="fo-sr">{labels.to}</span> {props.after}
                </>
              )}
            </span>
            {props.gain !== undefined ? (
              <span class="fo-file__gain">
                <Icon raw={checkIcon} />
                {props.gain}
              </span>
            ) : (
              props.note !== undefined && <span>{props.note}</span>
            )}
          </p>
        )}
        {(props.state === 'working' || props.state === 'waiting') && (
          <p class="fo-file__meta">
            <span>{props.status}</span>
          </p>
        )}
        {props.state === 'working' && (
          <div
            class="fo-bar"
            role="progressbar"
            aria-label={name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(props.progress * 100)}
            style={`--value:${props.progress}`}
          >
            <i />
          </div>
        )}
        {props.state === 'error' && (
          <p class="fo-file__meta">
            <span class="fo-file__err">
              <Icon raw={alertIcon} />
              <span>{props.reason}</span>
            </span>
          </p>
        )}
      </div>
      <div class="fo-file__actions">
        {props.state === 'done' && props.onDownload && (
          <button type="button" class="fo-btn fo-btn--icon" aria-label={named(labels.download, props.downloadName ?? name)} onClick={props.onDownload}>
            <Icon raw={downloadIcon} />
          </button>
        )}
        {(props.state === 'working' || props.state === 'waiting') && (
          <button type="button" class="fo-btn fo-btn--icon fo-btn--ghost" aria-label={named(labels.cancel, name)} onClick={props.onCancel}>
            <Icon raw={closeIcon} />
          </button>
        )}
        {props.state === 'error' && (
          <button type="button" class="fo-btn fo-btn--icon fo-btn--ghost" aria-label={named(labels.remove, name)} onClick={props.onRemove}>
            <Icon raw={trashIcon} />
          </button>
        )}
      </div>
    </div>
  );
}
