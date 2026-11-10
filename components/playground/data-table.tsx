import type {ParsedCsv} from '../../lib/csv';

type Props = {
  csv: ParsedCsv;
  labelIndex: number;
  caption: string;
  marker: string;
  queryLabel: string;
  supportLabel: string;
  scrollLabel: string;
  maxRows?: number;
};

export function DataTable({csv, labelIndex, caption, marker, queryLabel, supportLabel, scrollLabel, maxRows = 8}: Props) {
  const rows = csv.rows.slice(0, maxRows);
  return <div className="demo-scroll" tabIndex={0} role="region" aria-label={scrollLabel}>
    <table className="demo-table">
      <caption>{caption}</caption>
      <thead><tr>{csv.headers.map((header, index) => <th key={header} scope="col" data-label={index === labelIndex || undefined}>
        {header}{index === labelIndex && <span className="column-marker">{marker}</span>}
      </th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => {
        const isQuery = !row[labelIndex]?.trim();
        return <tr key={rowIndex} data-query={isQuery || undefined}>
          {row.map((cell, cellIndex) => <td key={cellIndex} data-label={cellIndex === labelIndex || undefined}>
            {cell || <span className="empty-cell">·</span>}
            {cellIndex === labelIndex && <span className="row-state">{isQuery ? queryLabel : supportLabel}</span>}
          </td>)}
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
