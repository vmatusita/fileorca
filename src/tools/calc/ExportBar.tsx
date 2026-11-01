// ExportBar (docs/design/components/ExportBar): Download PDF (the only yellow), CSV and Copy link, in that
// order, on the bg floor under the ResultHero. Copy link builds the address with the numbers after the #
// and puts it on the clipboard: the button turns into "Link copied" for 2 s and a role="status" region of
// its own says so. Without a clipboard, the link shows in a read-only field. No number goes to an event.
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import { track } from '../../analytics/events.ts';
import type { Lang } from '../../i18n/routes.ts';
import type { CalcPageId } from './registry.ts';
import type { CalcSharedTexts } from './types.ts';

export const COPIED_MS = 2000;

interface Props {
  page: CalcPageId;
  lang: Lang;
  t: CalcSharedTexts;
  icons: { pdf: string; table: string; link: string; check: string };
  /** Builds and saves the PDF; rejects when the PDF maker cannot load. */
  pdf: () => Promise<void>;
  csv: () => void;
  /** The address to copy, built at the moment of the click. */
  link: () => string;
}

export default function ExportBar({ page, lang, t, icons, pdf, csv, link }: Props) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (shown !== null) field.current?.select();
  }, [shown]);

  const copy = async () => {
    track('share_click', { tool: page, lang });
    const text = link();
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(text);
      setShown(null);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setShown(text);
    }
  };

  return (
    <div class="fo-export-wrap">
      <div class="fo-export">
        <button
          type="button"
          class="fo-btn fo-btn--download"
          aria-busy={busy ? 'true' : undefined}
          onClick={async () => {
            if (busy) return;
            track('export_click', { tool: page, lang, format: 'pdf' });
            setBusy(true);
            setFailed(false);
            try {
              await pdf();
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Icon inner={icons.pdf} />
          {t.pdf}
        </button>
        <button
          type="button"
          class="fo-btn"
          onClick={() => {
            track('export_click', { tool: page, lang, format: 'csv' });
            csv();
          }}
        >
          <Icon inner={icons.table} class="fo-icon--sm" />
          {t.csv}
        </button>
        <button type="button" class="fo-btn" onClick={() => void copy()}>
          {copied ? (
            <span class="fo-copied">
              <Icon inner={icons.check} />
              {t.copied}
            </span>
          ) : (
            <>
              <Icon inner={icons.link} class="fo-icon--sm" />
              {t.copyLink}
            </>
          )}
        </button>
      </div>
      <p class="fo-sr" role="status">
        {copied ? t.copied : ''}
      </p>
      {shown !== null && (
        <div class="fo-field">
          <label class="fo-field__label" for="fo-calc-link">
            {t.copyThis}
          </label>
          <div class="fo-input">
            <input ref={field} id="fo-calc-link" type="text" readOnly value={shown} />
          </div>
        </div>
      )}
      {failed && (
        <p class="fo-field__error" role="alert">
          {t.exportFailed}
        </p>
      )}
    </div>
  );
}
