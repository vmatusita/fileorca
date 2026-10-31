// FileCard (docs/design/components/FileCard): one file of a batch, with the folded corner in the category
// colour. Ready for the F2 queue; no page uses it yet (DECISOES § 53). The arrow between the sizes is
// the arrow-right icon with "to" / "para" / "a" for screen readers (the fonts have no →). The batch
// downloads through the ResultCard; the row buttons are secondary and named after the file.
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
}

export type FileCardProps = {
  name: string;
  category: 'image' | 'pdf';
  labels: FileCardLabels;
  /** Object URL of a thumbnail (never uploaded). */
  thumb?: string;
} & (
  | { state: 'done'; before: string; after: string; gain: string; onDownload: () => void }
  | { state: 'working'; status: string; progress: number; onCancel: () => void }
  | { state: 'error'; reason: string; onRemove: () => void }
);

const named = (label: string, name: string) => label.replace('{name}', name);

export default function FileCard(props: FileCardProps) {
  const { name, category, labels, thumb } = props;
  return (
    <div class={`fo-file fo-dogear fo-cat--${category}`} data-state={props.state === 'error' ? 'error' : undefined}>
      {props.state === 'error' ? (
        <div class="fo-file__thumb">
          <Icon raw={fileIcon} />
        </div>
      ) : thumb ? (
        <img class="fo-file__thumb" src={thumb} alt="" width={52} height={52} />
      ) : (
        <div class="fo-file__thumb" />
      )}
      <div>
        <p class="fo-file__name" title={name}>
          {name}
        </p>
        {props.state === 'done' && (
          <p class="fo-file__meta">
            <span>
              {props.before} <Icon raw={arrowIcon} class="fo-icon--inline" />
              <span class="fo-sr">{labels.to}</span> {props.after}
            </span>
            <span class="fo-file__gain">
              <Icon raw={checkIcon} />
              {props.gain}
            </span>
          </p>
        )}
        {props.state === 'working' && (
          <>
            <p class="fo-file__meta">
              <span>{props.status}</span>
            </p>
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
          </>
        )}
        {props.state === 'error' && (
          <p class="fo-file__meta">
            <span class="fo-file__err">
              <Icon raw={alertIcon} />
              {props.reason}
            </span>
          </p>
        )}
      </div>
      <div class="fo-file__actions">
        {props.state === 'done' && (
          <button type="button" class="fo-btn fo-btn--icon" aria-label={named(labels.download, name)} onClick={props.onDownload}>
            <Icon raw={downloadIcon} />
          </button>
        )}
        {props.state === 'working' && (
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
