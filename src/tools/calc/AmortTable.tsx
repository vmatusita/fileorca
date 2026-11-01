// AmortTable (docs/design/components/AmortTable): the whole schedule, grouped by loan year, no pages.
// Each year is a row with a button (aria-expanded, tap-min high) and the balance at the end of the year;
// opening it shows its payments. The first year starts open. Tabular figures, numbers to the right, the
// header stays on top while the table scrolls inside its own box (WCAG 1.4.10: the page never scrolls
// sideways). The schedule runs by payment number and loan year, never by calendar date. No ad inside.
import { useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import type { Cell, Table } from './types.ts';

export default function AmortTable({ table, cell, chevron }: { table: Table; cell: (value: Cell) => string; chevron: string }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const row = (cells: Cell[], key: number) => (
    <tr key={key}>
      {cells.map((value, index) => (
        <td key={index}>{cell(value)}</td>
      ))}
    </tr>
  );
  const body = table.groups
    ? table.groups.flatMap((group, index) => {
        const expanded = open.has(index);
        const toggle = () =>
          setOpen((current) => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
          });
        return [
          <tr class="fo-amort__year" key={`y${index}`}>
            <td colSpan={table.head.length - 1}>
              <button type="button" aria-expanded={expanded} onClick={toggle}>
                <Icon inner={chevron} />
                {group.label}
              </button>
            </td>
            <td>{cell(group.end)}</td>
          </tr>,
          ...(expanded ? table.rows.slice(group.from, group.to).map((cells, offset) => row(cells, group.from + offset)) : []),
        ];
      })
    : table.rows.map((cells, index) => row(cells, index));
  return (
    <div class="fo-amort-wrap" tabIndex={0} role="region" aria-label={table.caption}>
      <table class="fo-amort">
        <caption class="fo-sr">{table.caption}</caption>
        <thead>
          <tr>
            {table.head.map((heading) => (
              <th scope="col" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}
