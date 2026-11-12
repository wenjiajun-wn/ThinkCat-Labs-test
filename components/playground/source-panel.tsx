'use client';
import {useId, useRef, useState, type ReactNode} from 'react';
import type {ParsedCsv} from '../../lib/csv';
import {DataTable} from './data-table';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  csv: ParsedCsv | null;
  labelIndex: number;
  previewKey: number;
  isSample: boolean;
  fileError: string | null;
  datasetError: string | null;
  children: ReactNode;
  sourceName: string;
  onFile: (file: File) => void;
  onSample: () => void;
  showTargetSelector: boolean;
  onTargetChange: (index: number) => void;
};

export function SourcePanel({locale, csv, labelIndex, previewKey, isSample, fileError, datasetError, children, sourceName, onFile, onSample, showTargetSelector, onTargetChange}: Props) {
  const t = playgroundCopy[locale];
  const error = fileError ?? datasetError;
  const inputId = useId();
  const targetId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return <section className="workbench-panel source-panel" aria-label={t.source.title}>
    <p className="source-intro">{t.source.description}</p>
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
      {!csv && !fileError && <p role="status">{t.source.reading}</p>}
      {csv && <section className="preview-block" aria-label={t.preview.label}>
        <DataTable
          key={previewKey}
          locale={locale}
          csv={csv}
          labelIndex={labelIndex}
          isSample={isSample}
          caption={sourceName}
          rowLabel={t.preview.rowLabel}
          previousLabel={t.preview.previous}
          nextLabel={t.preview.next}
          pageLabel={t.preview.pageLabel}
          rowsLabel={t.source.rows}
          columnsLabel={t.source.columns}
          marker={t.preview.labelHeader}
          queryLabel={t.preview.query}
          scrollLabel={t.preview.scroll}
          explanation={labelIndex >= 0 ? t.preview.explanation : undefined}
          controls={showTargetSelector && <div className="preview-target">
            <label htmlFor={targetId}>{t.preview.targetLabel}</label>
            <select id={targetId} value={labelIndex < 0 ? '' : labelIndex} onChange={event => onTargetChange(Number(event.currentTarget.value))}>
              <option value="" disabled>{t.preview.targetPlaceholder}</option>
              {csv.headers.map((header, index) => <option key={header} value={index}>{header}</option>)}
            </select>
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
        <button className="button button-outline upload-button" type="button" aria-controls={inputId} onClick={() => inputRef.current?.click()}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m-4 4 4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
          {t.source.upload}
        </button>
        <button className="source-restore" type="button" onClick={onSample}>{t.source.sample}</button>
      </div>
      <div className="source-tools">
        <span className="dropzone-hint">{t.source.drop}</span>
        <details className="source-help">
          <summary>{t.source.help}</summary>
          <p>{t.source.requirements}</p>
          <p>{t.source.limits}</p>
        </details>
      </div>
    </div>
    <p className="source-notice" id="run-model-notice">{t.privacyNotice}</p>
  </section>;
}
