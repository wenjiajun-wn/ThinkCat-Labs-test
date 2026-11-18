'use client';
import {useState, type ReactNode} from 'react';
import {ScrollTable} from './scroll-table';
import {playgroundCopy} from '../../content/playground';
import type {PlaygroundRunState} from './result-types';
import type {ParsedCsv} from '../../lib/csv';
import {getDisplayColumnNames} from '../../lib/column-display';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  datasetId?: string;
  csv: ParsedCsv;
  labelIndex: number;
  caption: string;
  marker: string;
  queryLabel: string;
  scrollLabel: string;
  rowsLabel: string;
  columnsLabel: string;
  controls?: ReactNode;
  state: PlaygroundRunState;
};

export function DataTable({locale, datasetId, csv, labelIndex, caption, marker, queryLabel, scrollLabel, rowsLabel, columnsLabel, controls, state}: Props) {
  const t = playgroundCopy[locale];
  const displayHeaders = getDisplayColumnNames(csv.headers, locale, datasetId);
  const [queriesOnly, setQueriesOnly] = useState(false);
  const [page, setPage] = useState(0);
  const number = new Intl.NumberFormat(locale).format;
  const percent = new Intl.NumberFormat(locale, {style: 'percent', maximumFractionDigits: 2}).format;
  // Display predictions by original parsed row index; never write them into input labels.
  const predictions = new Map(state.status === 'success' ? state.result.predictions.map(row => [row.index, row]) : []);
  const evaluation = state.status === 'success' && state.source.kind === 'builtin' && state.evaluation?.status === 'success' ? state.evaluation : null;
  const actualRows = new Map(evaluation?.rows.map(row => [row.index, row]));
  const queryCount = labelIndex < 0 ? 0 : csv.rows.filter(row => !row[labelIndex]?.trim()).length;

  const indices = csv.rows.flatMap((row, index) => !queriesOnly || (labelIndex >= 0 && !row[labelIndex]?.trim()) ? [index] : []);
  const pageCount = Math.max(1, Math.ceil(indices.length / 200));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleIndices = indices.slice(currentPage * 200, (currentPage + 1) * 200);

  return <div className="data-preview">
    <div className="preview-toolbar">
      <h3>{caption}</h3>
      <span className="preview-meta">{number(csv.rows.length)} {rowsLabel} · {number(csv.headers.length)} {columnsLabel}</span>
    </div>
    {controls}
    {queryCount > 0 && <div className="preview-filter">
      <label><input type="checkbox" checked={queriesOnly} onChange={event => { setQueriesOnly(event.currentTarget.checked); setPage(0); }} />{state.status === 'success' ? t.preview.predictedOnly : t.preview.queriesOnly} <span>({number(queryCount)})</span></label>
    </div>}
    <ScrollTable key={`${currentPage}-${queriesOnly}`} className="source-table-scroll" label={scrollLabel}>
      <table className="demo-table source-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead><tr>
          {displayHeaders.map((header, index) => <th key={csv.headers[index]} title={csv.headers[index]} scope="col" data-label={index === labelIndex || undefined} className={index === labelIndex ? undefined : 'numeric-cell'} aria-label={index === labelIndex ? `${header}, ${marker}` : undefined}>
            {header}
            {index === labelIndex && <span className="target-column-marker">{t.preview.targetLabel}</span>}
          </th>)}
        </tr></thead>
        <tbody>{visibleIndices.map(index => {
          const row = csv.rows[index];
          const isQuery = labelIndex >= 0 && !row[labelIndex]?.trim();
          if (queriesOnly && !isQuery) return null;
          const prediction = isQuery ? predictions.get(index) : undefined;
          const actual = prediction ? actualRows.get(index) : undefined;
          return <tr key={index} data-source-row={csv.rowLineNumbers[index]} data-query={isQuery || undefined} data-predicted={Boolean(prediction) || undefined}>
            {row.map((cell, cellIndex) => <td key={cellIndex} data-label={cellIndex === labelIndex || undefined} className={cellIndex === labelIndex ? undefined : 'numeric-cell'}>
              <span data-selectable>{cellIndex === labelIndex && isQuery ? prediction ? <span className="inline-prediction">
                <span className="prediction-label">{prediction.label}</span>
                <span className="prediction-meta">{t.results.probability} · {percent(prediction.probability)}</span>
                {actual && <span className="prediction-actual" data-correct={actual.isCorrect}>
                  {t.evaluation.actualLabel}: {actual.label} · {actual.isCorrect ? t.evaluation.correct : t.evaluation.incorrect}
                </span>}
              </span> : <span className="prediction-placeholder">{state.status === 'running' ? t.states.runningLabel : queryLabel}</span> : cell || <span className="empty-cell">—</span>}</span>
            </td>)}
          </tr>;
        })}</tbody>
      </table>
    </ScrollTable>
    {pageCount > 1 && <nav className="preview-pagination" aria-label={t.preview.page}>
      <span aria-live="polite">{t.preview.page} {number(currentPage + 1)} / {number(pageCount)}</span>
      <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>{t.preview.previous}</button>
      <button type="button" disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>{t.preview.next}</button>
    </nav>}
  </div>;
}
