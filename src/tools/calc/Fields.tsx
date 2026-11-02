// The form of a calculator, drawn from its field specs: number fields (CalcField), the down payment with
// its unit menu, choices (OptionGroup or <select>), the list of debts or of areas (each area with its shape menu, F7)
// and the date field (F7). No ad ever sits between them.
import { useEffect, useRef } from 'preact/hooks';
import OptionGroup from '../image/OptionGroup.tsx';
import Icon from '../../icons/Icon.tsx';
import { fmt } from '../../i18n/format.ts';
import type { NumberLang } from '../../calc/parse.ts';
import CalcField from './CalcField.tsx';
import DateField from './DateField.tsx';
import { visible, type Problems } from './form.ts';
import type { CalcPanelData, FieldSpec, ListSpec, NumberSpec, Values } from './types.ts';

interface Props {
  specs: readonly FieldSpec[];
  values: Values;
  problems: Problems;
  data: CalcPanelData;
  set: (values: Values) => void;
  /** The store's record of the fields that show their range error (DECISOES § 116 and § 276). */
  report?: ((id: string, wrong: boolean) => void) | undefined;
}

const fieldId = (key: string): string => `fo-calc-${key}`;

/**
 * The list whose Add button below the result was just pressed. Only that press takes the focus to the new row: the rows of
 * a scenario link, read after hydration, leave the focus and the scroll where they are (review F7, a-1; DECISOES § 278).
 */
let addedBelow: string | null = null;

function NumberInput(props: Props & {
  spec: NumberSpec;
  keyName: string;
  value: number;
  onValue: (value: number) => void;
  label?: string;
  /** The texts of the field when they depend on a row's menu ("x-circle"), else the spec's key. */
  textKey?: string;
}) {
  const { spec, problems, data, keyName, value, onValue, label, textKey } = props;
  const texts = (textKey ? data.texts.fields[textKey] : undefined) ?? data.texts.fields[spec.key];
  if (!texts) throw new Error(`no texts for field ${spec.key}`);
  return (
    <CalcField
      id={fieldId(keyName)}
      kind={spec.kind}
      decimals={spec.decimals}
      min={spec.min}
      max={spec.max}
      negative={spec.negative === true}
      value={value}
      onValue={onValue}
      lang={data.lang as NumberLang}
      label={label ?? texts.label}
      help={texts.help}
      error={texts.error}
      over={problems[keyName] === 'over' ? texts.over : undefined}
      hint={data.t.decimalHint}
      prefix={texts.prefix}
      suffix={texts.suffix}
      tag={spec.example ? data.t.example : undefined}
      half={spec.half}
      report={props.report}
    />
  );
}

/** A text of the list (a row's name, Add, Remove): the calculator's own ("Area {n}", F7), else the shared one ("Debt {n}"). */
const listText = (data: CalcPanelData, key: 'row' | 'addRow' | 'removeRow'): string => data.texts.view[key] ?? data.t[key];

/**
 * The list of debts or of areas. Each row keeps a key of its own (removing the second debt no longer hands its fields to the
 * third), and the keyboard focus never falls to the page when a button goes away: a debt added takes the focus to
 * its first field; a debt removed, to the next Remove button, or to Add a debt when none is left (review F4, ACE-6).
 */
function DebtList(props: Props & { spec: ListSpec }) {
  const { spec, values, data, set } = props;
  const rows = values[spec.key] as Record<string, number>[];
  const keys = useRef<number[]>([]);
  const nextKey = useRef(0);
  const focusNext = useRef<string | null>(null);
  while (keys.current.length < rows.length) keys.current.push(nextKey.current++);
  keys.current.length = rows.length;
  // A row added by the Add button below the result (addBelow) takes the focus to its first control too.
  const length = useRef(rows.length);
  useEffect(() => {
    if (focusNext.current === null && addedBelow === spec.key && rows.length > length.current) focusNext.current = fieldId(`${spec.key}${rows.length - 1}${spec.pick?.key ?? spec.item[0]?.key ?? ''}`);
    if (addedBelow === spec.key) addedBelow = null;
    length.current = rows.length;
    if (focusNext.current === null) return;
    document.getElementById(focusNext.current)?.focus();
    focusNext.current = null;
  });
  const update = (index: number, key: string, value: number) =>
    set({ ...values, [spec.key]: rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)) });
  const removeId = (index: number) => fieldId(`${spec.key}${index}-remove`);
  const addId = fieldId(`${spec.key}-add`);
  const remove = (index: number) => {
    const left = rows.length - 1;
    keys.current.splice(index, 1);
    focusNext.current = left > spec.min ? removeId(Math.min(index, left - 1)) : addId;
    set({ ...values, [spec.key]: rows.filter((_, i) => i !== index) });
  };
  const add = () => {
    focusNext.current = fieldId(`${spec.key}${rows.length}${spec.pick?.key ?? spec.item[0]?.key ?? ''}`);
    set({ ...values, [spec.key]: [...rows, { ...spec.blank }] });
  };
  const pick = spec.pick;
  const pickTexts = pick ? data.texts.fields[pick.key] : undefined;
  const pickLabels = pick ? (data.texts.options?.[pick.key] ?? {}) : {};
  return (
    <div class="fo-debts">
      {rows.map((row, index) => (
        <fieldset class="fo-debt" key={keys.current[index]}>
          <legend class="fo-debt__name">{fmt(listText(data, 'row'), { n: index + 1 })}</legend>
          <div class="fo-debt__fields">
            {pick && (
              <div class="fo-field">
                <label class="fo-field__label" for={fieldId(`${spec.key}${index}${pick.key}`)}>
                  {pickTexts?.label ?? pick.key}
                </label>
                <div class="fo-field__body">
                  <div class="fo-input">
                    <select
                      id={fieldId(`${spec.key}${index}${pick.key}`)}
                      value={String(row[pick.key] ?? 0)}
                      onChange={(event) => update(index, pick.key, Number(event.currentTarget.value))}
                    >
                      {pick.options.map((option, at) => (
                        <option key={option} value={String(at)}>
                          {pickLabels[option] ?? option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            {spec.item.map((item) => {
              const chosen = pick ? (pick.options[row[pick.key] ?? 0] ?? '') : '';
              if (pick?.hide?.[item.key]?.includes(row[pick.key] ?? 0)) return null;
              return (
                <NumberInput
                  {...props}
                  key={item.key}
                  spec={item}
                  keyName={`${spec.key}${index}${item.key}`}
                  textKey={chosen ? `${item.key}-${chosen}` : item.key}
                  value={row[item.key] ?? 0}
                  onValue={(value) => update(index, item.key, value)}
                />
              );
            })}
          </div>
          {rows.length > spec.min && (
            <button type="button" id={removeId(index)} class="fo-btn fo-btn--ghost fo-debt__remove" onClick={() => remove(index)}>
              <Icon inner={data.icons.trash} class="fo-icon--sm" />
              <span>{fmt(listText(data, 'removeRow'), { n: index + 1 })}</span>
            </button>
          )}
        </fieldset>
      ))}
      {rows.length < spec.max && !spec.addBelow && (
        <button type="button" id={addId} class="fo-btn" onClick={add}>
          {listText(data, 'addRow')}
        </button>
      )}
    </div>
  );
}

/** The Add button of a list whose rows come before the result and whose button comes after it (ListSpec.addBelow). */
export function AddRow({ spec, values, data, set }: Props & { spec: ListSpec }) {
  const rows = values[spec.key] as Record<string, number>[];
  if (rows.length >= spec.max) return null;
  return (
    <button
      type="button"
      id={fieldId(`${spec.key}-add`)}
      class="fo-btn"
      onClick={() => {
        addedBelow = spec.key;
        set({ ...values, [spec.key]: [...rows, { ...spec.blank }] });
      }}
    >
      {listText(data, 'addRow')}
    </button>
  );
}

export function Field(props: Props & { spec: FieldSpec }) {
  const { spec, values, data, set } = props;
  if (!visible(spec, values)) return null;
  switch (spec.kind) {
    case 'money':
    case 'rate':
    case 'int':
    case 'dec':
      return (
        <NumberInput
          {...props}
          spec={spec}
          keyName={spec.key}
          value={Number(values[spec.key])}
          onValue={(value) => set({ ...values, [spec.key]: value })}
        />
      );
    case 'down': {
      const texts = data.texts.fields[spec.key];
      if (!texts) throw new Error(`no texts for field ${spec.key}`);
      const percent = values[spec.unitKey] === 'percent';
      const lang = data.lang as NumberLang;
      const price = Number(values[spec.of]);
      const unit = (
        <select
          class="fo-input__unit"
          aria-label={data.t.unitLabel}
          value={String(values[spec.unitKey])}
          onChange={(event) => {
            const next = event.currentTarget.value;
            // Switching the unit keeps the same down payment: the other unit is worked out from the price.
            const converted = next === 'percent'
              ? { [spec.percentKey]: price > 0 ? Math.min(1_000_000, Math.round((Number(values[spec.key]) * 1_000_000) / price)) : 0 }
              : { [spec.key]: Math.round((price * Number(values[spec.percentKey])) / 1_000_000) };
            set({ ...values, ...converted, [spec.unitKey]: next });
          }}
        >
          <option value="amount">{data.t.units.amount}</option>
          <option value="percent">{data.t.units.percent}</option>
        </select>
      );
      // No line under the field with the other unit: on a phone the down payment is half a row, and that line
      // pushed the result below the fold (DECISOES § 124). The unit menu switches and converts it.
      return (
        <CalcField
          id={fieldId(spec.key)}
          kind={percent ? 'rate' : 'money'}
          min={0}
          max={percent ? 1_000_000 : spec.max}
          value={Number(values[percent ? spec.percentKey : spec.key])}
          onValue={(value) => set({ ...values, [percent ? spec.percentKey : spec.key]: value })}
          lang={lang}
          label={texts.label}
          error={percent ? (data.texts.fields[spec.percentKey]?.error ?? texts.error) : texts.error}
          over={props.problems[spec.key] === 'over' ? texts.over : undefined}
          hint={data.t.decimalHint}
          half={spec.half}
          unit={unit}
          report={props.report}
        />
      );
    }
    case 'choice': {
      const texts = data.texts.fields[spec.key];
      const labels = data.texts.options?.[spec.key] ?? {};
      return (
        <OptionGroup
          name={fieldId(spec.key)}
          legend={texts?.label ?? spec.key}
          value={String(values[spec.key])}
          choices={spec.options.map((option) => ({ value: option, label: labels[option] ?? option }))}
          onChange={(value) => set({ ...values, [spec.key]: value })}
        />
      );
    }
    case 'select': {
      const texts = data.texts.fields[spec.key];
      const labels = data.texts.options?.[spec.key] ?? {};
      return (
        <div class={spec.half ? 'fo-field fo-field--half' : 'fo-field'}>
          <label class="fo-field__label" for={fieldId(spec.key)}>
            {texts?.label ?? spec.key}
          </label>
          {/* In the field body like a number or a date: the box keeps its height when the field beside it shows an error (review F7, f-5; DECISOES § 277). */}
          <div class="fo-field__body">
            <div class="fo-input">
              <select id={fieldId(spec.key)} value={String(values[spec.key])} onChange={(event) => set({ ...values, [spec.key]: event.currentTarget.value })}>
                {spec.options.map((option) => (
                  <option key={option} value={option}>
                    {labels[option] ?? option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }
    case 'list':
      return <DebtList {...props} spec={spec} />;
    case 'date': {
      const texts = data.texts.fields[spec.key];
      if (!texts) throw new Error(`no texts for field ${spec.key}`);
      return (
        <DateField
          id={fieldId(spec.key)}
          value={String(values[spec.key])}
          min={spec.min}
          max={spec.max}
          onValue={(value) => set({ ...values, [spec.key]: value })}
          label={texts.label}
          error={texts.error}
          half={spec.half}
          report={props.report}
        />
      );
    }
  }
}

export default function Fields(props: Props) {
  return (
    <>
      {props.specs.map((spec) => (
        <Field {...props} key={spec.key} spec={spec} />
      ))}
    </>
  );
}
