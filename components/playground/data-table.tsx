'use client';
import {useId, useState, type ReactNode} from 'react';
import type {ParsedCsv} from '../../lib/csv';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  csv: ParsedCsv;
  labelIndex: number;
  isSample: boolean;
  caption: string;
  rowLabel: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
  marker: string;
  queryLabel: string;
  scrollLabel: string;
  rowsLabel: string;
  columnsLabel: string;
  explanation?: string;
  controls?: ReactNode;
};

export function DataTable({locale, csv, labelIndex, isSample, caption, rowLabel, previousLabel, nextLabel, pageLabel, marker, queryLabel, scrollLabel, rowsLabel, columnsLabel, explanation, controls}: Props) {
  const maxRows = 6;
  const [page, setPage] = useState(0);
  const tableId = useId();
  const start = page * maxRows;
  const indices = csv.rows.map((_, index) => index);
  // Bring real example query rows into view without changing the data sent to the API.
  const labeled = indices.filter(index => csv.rows[index][labelIndex]?.trim());
  const queries = indices.filter(index => !csv.rows[index][labelIndex]?.trim());
  const featured = isSample && labelIndex >= 0 && labeled.length >= 4 && queries.length >= 2
    ? [...labeled.slice(0, 4), ...queries.slice(0, 2)] : [];
  const featuredSet = new Set(featured);
  const orderedIndices = [...featured, ...indices.filter(index => !featuredSet.has(index))];
  const rows = orderedIndices.slice(start, start + maxRows);
  const end = start + rows.length;
  const number = new Intl.NumberFormat(locale).format;

  return <div className="data-preview">
    <div className="preview-toolbar">
      <h3>{caption}</h3>
      <span className="preview-meta">{number(csv.rows.length)} {rowsLabel} · {number(csv.headers.length)} {columnsLabel}</span>
    </div>
    {controls}
    <div id={tableId} className="demo-scroll source-table-scroll" tabIndex={0} role="region" aria-label={scrollLabel}>
      <table className={`demo-table source-table${isSample ? ' source-table-sample' : ''}`}>
        <caption className="visually-hidden">{caption}</caption>
        <thead><tr>
          <th scope="col" className="source-row-number">{rowLabel}</th>
          {csv.headers.map((header, index) => <th key={header} scope="col" data-label={index === labelIndex || undefined} className={index === labelIndex ? undefined : 'numeric-cell'} aria-label={index === labelIndex ? `${header}, ${marker}` : undefined}>
            {header}
          </th>)}
        </tr></thead>
        <tbody>{rows.map(index => {
          const row = csv.rows[index];
          const isQuery = labelIndex >= 0 && !row[labelIndex]?.trim();
          return <tr key={index} data-query={isQuery || undefined}>
            <th scope="row" className="source-row-number">{number(csv.rowLineNumbers[index])}</th>
            {row.map((cell, cellIndex) => <td key={cellIndex} data-label={cellIndex === labelIndex || undefined} className={cellIndex === labelIndex ? undefined : 'numeric-cell'}>
              {cellIndex === labelIndex && isQuery ? <span className="prediction-placeholder">{queryLabel}</span> : cell || <span className="empty-cell">—</span>}
            </td>)}
          </tr>;
        })}</tbody>
      </table>
    </div>
    {(explanation || csv.rows.length > maxRows) && <div className="preview-pagination">
      {explanation && <p className="preview-explanation">{explanation}</p>}
      {csv.rows.length > maxRows && <div className="preview-pagination-actions">
        <span className="preview-page-status" role="status">{pageLabel} {number(start + 1)}–{number(end)}</span>
        <button id="preview-previous" type="button" disabled={page === 0} aria-controls={tableId} onClick={() => setPage(value => value - 1)}>{previousLabel}</button>
        <button id="preview-next" type="button" disabled={end >= csv.rows.length} aria-controls={tableId} onClick={() => setPage(value => value + 1)}>{nextLabel}</button>
      </div>}
    </div>}
  </div>;
}
