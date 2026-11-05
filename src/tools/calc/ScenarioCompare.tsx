// ScenarioCompare (docs/design/components/ScenarioCompare): two scenarios side by side with the same rows,
// named A and B in deep circles, and one line that says the difference on both sides without naming a
// winner: the tool is educational. Side by side down to 320 px, with the number in 20 px below 480 px (F13b, D-38; DECISOES
// § C-6: they stacked under 340 px of column, with the line on top).
import Icon from '../../icons/Icon.tsx';
import { Sentence } from './ResultHero.tsx';
import type { CalcView } from './types.ts';

export default function ScenarioCompare({ compare, info, label }: { compare: NonNullable<CalcView['compare']>; info: string; label: string }) {
  const card = (letter: string, scenario: (typeof compare)['a']) => (
    <div class="fo-scn">
      <span class="fo-scn__name">
        <i aria-hidden="true">{letter}</i>
        {scenario.name}
      </span>
      <dl>
        {scenario.rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return (
    <section class="fo-compare" aria-label={label}>
      {card('A', compare.a)}
      {card('B', compare.b)}
      <p class="fo-diff">
        <Icon inner={info} />
        <span>
          <Sentence parts={compare.diff} />
        </span>
      </p>
    </section>
  );
}
