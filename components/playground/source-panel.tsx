'use client';
import {Button, FormControl} from '../ui/primitives';
import {useId, useRef, useState, type ReactNode} from 'react';
import type {PlaygroundExample} from '../../lib/playground-datasets';
import type {ParsedCsv} from '../../lib/csv';
import {getDisplayColumnNames} from '../../lib/column-display';
import {DataTable} from './data-table';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';

type Props = {
  locale: Locale;
  csv: ParsedCsv | null;
  labelIndex: number;
  previewKey: number;
  reading: boolean;
  example?: PlaygroundExample;
  exampleCount: number;
  fileError: string | null;
  datasetError: string | null;
  children: ReactNode;
  comparison: ReactNode;
  sourceName: string;
  onFile: (file: File) => void;
  onSample: () => void;
  showTargetSelector: boolean;
  onTargetChange: (index: number) => void;
  state: PlaygroundRunState;
  onDownload: () => void;
};

export function SourcePanel({locale, csv, labelIndex, previewKey, reading, example, exampleCount, fileError, datasetError, children, comparison, sourceName, onFile, onSample, showTargetSelector, onTargetChange, state, onDownload}: Props) {
  const t = playgroundCopy[locale];
  const error = fileError ?? datasetError;
  const inputId = useId();
  const targetId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return <section className="workbench-panel source-panel" aria-label={t.source.title}>
    <div
      className={`dropzone${dragging ? ' is-dragging' : ''}`}
      onDragOver={event => {event.preventDefault(); setDragging(event.dataTransfer.types.includes('Files'));}}
      onDragLeave={event => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setDragging(false);
      }}
      onDrop={event => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      {!csv && !fileError && <p className="dataset-pending" role="status">{reading ? t.source.reading : t.source.pending}</p>}
      {csv && <section className="preview-block" aria-label={t.preview.label}>
        <DataTable
          key={previewKey}
          locale={locale}
          datasetId={example?.id}
          csv={csv}
          state={state}
          labelIndex={labelIndex}
          caption={sourceName}
          rowsLabel={t.source.rows}
          columnsLabel={t.source.columns}
          marker={t.preview.labelHeader}
          queryLabel={t.preview.query}
          scrollLabel={t.preview.scroll}
          controls={showTargetSelector && <div className="preview-target">
            <label htmlFor={targetId}>{t.preview.targetLabel}</label>
            <FormControl id={targetId} value={labelIndex < 0 ? '' : labelIndex} aria-invalid={labelIndex < 0 || undefined} aria-describedby={error ? 'workbench-error' : undefined} onChange={event => onTargetChange(Number(event.currentTarget.value))}>
              <option value="" disabled>{t.preview.targetPlaceholder}</option>
              {getDisplayColumnNames(csv.headers, locale, example?.id).map((header, index) => <option key={csv.headers[index]} title={csv.headers[index]} value={index}>{header}</option>)}
            </FormControl>
          </div>}
        />
      </section>}
      {error && <p className="inline-error" id="workbench-error" role="alert">{error}</p>}
      <div className="workbench-actions">
        {children}
        <input
          ref={inputRef}
          id={inputId}
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          tabIndex={-1}
          aria-hidden="true"
          onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) onFile(file);
          }}
        />
        <Button className="button button-outline upload-button" type="button" aria-controls={inputId} onClick={() => inputRef.current?.click()}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m-4 4 4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
          {t.source.upload}
        </Button>
        <Button id="switch-example" className="button button-outline" type="button" disabled={exampleCount < 2} aria-describedby={exampleCount < 2 ? "example-unavailable" : undefined} onClick={onSample}>{t.source.sample}</Button>
        {state.status === 'success' && <Button id="download-results" className="button button-outline" type="button" onClick={onDownload}>{t.results.download}</Button>}
      </div>
      {exampleCount < 2 && <p id="example-unavailable" className="dataset-source">{exampleCount === 0 ? t.source.pending : t.source.onlyOne}</p>}
      {comparison}
    </div>
  </section>;
}
