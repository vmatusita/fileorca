// AmortTable (docs/design/components/AmortTable): the whole schedule, grouped by loan year, no pages.
// Each year is a row with a button (aria-expanded, tap-min high) and the balance at the end of the year;
// opening it shows its payments. The first year starts open. Tabular figures, numbers to the right, the
// header stays on top while the table scrolls inside its own box (WCAG 1.4.10: the page never scrolls
// sideways). The schedule runs by payment number and loan year, never by calendar date. No ad inside.
// F13b (F4 ACE-9, the half of the calculators; DECISOES § 548): the first cell of every row of data is its header (th
// scope="row"), drawn like the cell it replaces (no sticky), and the region of the frame is named by the heading of its
// section, not by the caption of the table, which says the rest.
import { useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import type { Cell, Table } from './types.ts';

export default function AmortTable({ table, cell, chevron, labelledBy }: { table: Table; cell: (value: Cell) => string; chevron: string; labelledBy: string }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const row = (cells: Cell[], key: number) => (
    <tr key={key}>
      {cells.map((value, index) =>
        index === 0 ? (
          <th scope="row" key={index}>
            {cell(value)}
          </th>
        ) : (
          <td key={index}>{cell(value)}</td>
        ),
      )}
    </tr>
  );
  const body = table.groups
    ? table.groups.flatMap((group, index) => {
        // The balance at the end of the year goes under the balance column (the SAC × PRICE has columns after it).
        const end = table.endColumn ?? table.head.length - 1;
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
            <td colSpan={end}>
              <button type="button" aria-expanded={expanded} onClick={toggle}>
                <Icon inner={chevron} />
                {group.label}
              </button>
            </td>
            <td>{cell(group.end)}</td>
            {end < table.head.length - 1 && <td colSpan={table.head.length - 1 - end} />}
          </tr>,
          ...(expanded ? table.rows.slice(group.from, group.to).map((cells, offset) => row(cells, group.from + offset)) : []),
        ];
      })
    : table.rows.map((cells, index) => row(cells, index));
  return (
    <div class="fo-amort-wrap" tabIndex={0} role="region" aria-labelledby={labelledBy}>
      <table class={table.groups ? 'fo-amort' : table.even ? 'fo-amort fo-amort--flat fo-amort--even' : 'fo-amort fo-amort--flat'}>
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
