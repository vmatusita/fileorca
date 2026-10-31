// OptionGroup (docs/design/components/OptionGroup): the segmented rail of 2 to 4 choices, a
// <fieldset> with a <legend> and a radio inside every <label>. Arrow keys switch the choice; changing
// it processes the batch again at once (no Apply button). Every image tool with a choice uses it.
export interface Choice<V extends string> {
  value: V;
  label: string;
  /** A short line under the label ("best balance"). */
  help?: string;
}

export interface OptionGroupProps<V extends string> {
  /** Radio group name: unique on the page. */
  name: string;
  legend: string;
  value: V;
  choices: readonly Choice<V>[];
  onChange: (value: V) => void;
  /** A line under the rail that explains what changes between the choices. */
  note?: string;
  /** Id of that line, so a field can point at it with aria-describedby. */
  noteId?: string;
}

export default function OptionGroup<V extends string>({ name, legend, value, choices, onChange, note, noteId }: OptionGroupProps<V>) {
  return (
    <fieldset class="fo-field fo-options" aria-describedby={note ? noteId : undefined}>
      <legend class="fo-field__label">{legend}</legend>
      <div class="fo-seg">
        {choices.map((choice) => (
          <label class="fo-seg__opt" key={choice.value}>
            <input type="radio" name={name} value={choice.value} checked={value === choice.value} onChange={() => onChange(choice.value)} />
            {choice.label}
            {choice.help && <small>{choice.help}</small>}
          </label>
        ))}
      </div>
      {note && (
        <p class="fo-field__help" id={noteId}>
          {note}
        </p>
      )}
    </fieldset>
  );
}
