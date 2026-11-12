'use client';
import {useId, useState} from 'react';
import type {KumoResult} from '../../lib/kumo-api';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  predictions: KumoResult['predictions'];
  headers: string[];
  labelIndex: number;
  onDownload: () => void;
};

const pageSize = 10;

export function PredictionTable({locale, predictions, headers, labelIndex, onDownload}: Props) {
  const t = playgroundCopy[locale];
  const [page, setPage] = useState(0);
  const tableId = useId();
  const headingId = useId();
  const number = new Intl.NumberFormat(locale).format;
  const formatProbability = new Intl.NumberFormat(locale, {style: 'percent', maximumFractionDigits: 2}).format;
  const features = headers.map((header, index) => ({header, index})).filter(({index}) => index !== labelIndex);
  const start = page * pageSize;
  const rows = predictions.slice(start, start + pageSize);
  const end = start + rows.length;

  return <div className="result-table-wrap">
    <div className="result-table-head">
      <h3 id={headingId}>{t.results.tableCaption}</h3>
      <button id="download-results" className="button button-outline" type="button" onClick={onDownload}>{t.results.download}</button>
    </div>
    <div id={tableId} className="demo-scroll result-table-scroll" tabIndex={0} role="region" aria-labelledby={headingId}>
      <table className="demo-table result-table">
        <caption className="visually-hidden">{t.results.tableCaption}</caption>
        <thead><tr>
          <th scope="col" className="result-row-number">{t.results.query}</th>
          {features.map(({header, index}) => <th scope="col" className="numeric-cell" key={index}>{header}</th>)}
          <th scope="col" className="prediction-column">{t.results.prediction}</th>
          <th scope="col" className="numeric-cell">{t.results.probability}</th>
        </tr></thead>
        <tbody>{rows.map((prediction, rowIndex) => <tr key={prediction.index}>
          <th scope="row" className="result-row-number">
            <span className="result-sample-number">{number(start + rowIndex + 1)}</span>
            <span className="result-line-number">/ {number(prediction.sourceLine)}</span>
          </th>
          {features.map(({index}) => <td className="numeric-cell" key={index}>{prediction.cells[index]}</td>)}
          <td className="prediction-cell"><span className="prediction-label">{prediction.label}</span></td>
          <td className="numeric-cell probability-cell">{formatProbability(prediction.probability)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {predictions.length > pageSize && <div className="result-pagination">
      <span role="status">{number(start + 1)}-{number(end)} / {number(predictions.length)}</span>
      <div className="result-pagination-actions">
        <button id="result-previous" type="button" disabled={page === 0} aria-controls={tableId} onClick={() => setPage(value => value - 1)}>{t.results.previous}</button>
        <button id="result-next" type="button" disabled={end >= predictions.length} aria-controls={tableId} onClick={() => setPage(value => value + 1)}>{t.results.next}</button>
      </div>
    </div>}
  </div>;
}
