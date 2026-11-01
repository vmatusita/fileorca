// The form of a calculator, drawn from its field specs: number fields (CalcField), the down payment with
// its unit menu, choices (OptionGroup or <select>) and the list of debts. No ad ever sits between them.
import OptionGroup from '../image/OptionGroup.tsx';
import Icon from '../../icons/Icon.tsx';
import { fmt } from '../../i18n/format.ts';
import type { NumberLang } from '../../calc/parse.ts';
import CalcField from './CalcField.tsx';
import { visible, type Problems } from './form.ts';
import type { CalcPanelData, FieldSpec, ListSpec, NumberSpec, Values } from './types.ts';

interface Props {
  specs: readonly FieldSpec[];
  values: Values;
  problems: Problems;
  data: CalcPanelData;
  set: (values: Values) => void;
}

const fieldId = (key: string): string => `fo-calc-${key}`;

function NumberInput({ spec, values, problems, data, set, keyName, value, onValue, label }: Props & {
  spec: NumberSpec;
  keyName: string;
  value: number;
  onValue: (value: number) => void;
  label?: string;
}) {
  const texts = data.texts.fields[spec.key];
  if (!texts) throw new Error(`no texts for field ${spec.key}`);
  void values;
  void set;
  return (
    <CalcField
      id={fieldId(keyName)}
      kind={spec.kind}
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
      prefix={texts.prefix}
      suffix={texts.suffix}
      tag={spec.example ? data.t.example : undefined}
      half={spec.half}
    />
  );
}

function DebtList(props: Props & { spec: ListSpec }) {
  const { spec, values, data, set } = props;
  const rows = values[spec.key] as Record<string, number>[];
  const update = (index: number, key: string, value: number) =>
    set({ ...values, [spec.key]: rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)) });
  return (
    <div class="fo-debts">
      {rows.map((row, index) => (
        <fieldset class="fo-debt" key={index}>
          <legend class="fo-debt__name">{fmt(data.t.row, { n: index + 1 })}</legend>
          <div class="fo-debt__fields">
            {spec.item.map((item) => (
              <NumberInput
                {...props}
                key={item.key}
                spec={item}
                keyName={`${spec.key}${index}${item.key}`}
                value={row[item.key] ?? 0}
                onValue={(value) => update(index, item.key, value)}
              />
            ))}
          </div>
          {rows.length > spec.min && (
            <button
              type="button"
              class="fo-btn fo-btn--ghost fo-debt__remove"
              onClick={() => set({ ...values, [spec.key]: rows.filter((_, i) => i !== index) })}
            >
              <Icon inner={data.icons.trash} class="fo-icon--sm" />
              <span>{fmt(data.t.removeRow, { n: index + 1 })}</span>
            </button>
          )}
        </fieldset>
      ))}
      {rows.length < spec.max && (
        <button type="button" class="fo-btn" onClick={() => set({ ...values, [spec.key]: [...rows, { ...spec.blank }] })}>
          {data.t.addRow}
        </button>
      )}
    </div>
  );
}

export function Field(props: Props & { spec: FieldSpec }) {
  const { spec, values, data, set } = props;
  if (!visible(spec, values)) return null;
  switch (spec.kind) {
    case 'money':
    case 'rate':
    case 'int':
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
          half={spec.half}
          unit={unit}
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
      );
    }
    case 'list':
      return <DebtList {...props} spec={spec} />;
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
