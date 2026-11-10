'use client';
import {useId, useRef, useState} from 'react';
import type {ParsedCsv} from '../../lib/csv';
import {formatBytes} from '../../lib/csv';
import {DataTable} from './data-table';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  csv: ParsedCsv | null;
  labelIndex: number;
  fileError: string | null;
  sourceName: string;
  onFile: (file: File) => void;
  onSample: () => void;
};

export function SourcePanel({locale, csv, labelIndex, fileError, sourceName, onFile, onSample}: Props) {
  const t = playgroundCopy[locale];
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return <section className="workbench-panel source-panel" aria-labelledby="source-heading">
    <div className="panel-head">
      <span className="mono-label">{t.source.label}</span>
      <h2 id="source-heading">{t.source.title}</h2>
      <p>{t.source.description}</p>
    </div>
    <div
      className={`dropzone${dragging ? ' is-dragging' : ''}${fileError ? ' has-error' : ''}`}
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
      <span className="dropzone-mark" aria-hidden="true">↓</span>
      <div className="dropzone-copy">
        <strong>{t.source.drop}</strong>
        <span id={`${inputId}-limits`}>{t.source.limits}</span>
      </div>
      <div className="dropzone-actions">
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
        <button className="button button-outline" type="button" aria-controls={inputId} aria-describedby={`${inputId}-limits`} onClick={() => inputRef.current?.click()}>{csv ? t.source.replace : t.source.choose}</button>
        <button className="text-link" type="button" onClick={onSample}>{t.source.sample}</button>
      </div>
    </div>
    {fileError && <p className="inline-error" role="alert">{fileError}</p>}
    <div className="source-meta" role="status">
      {!csv && !fileError && <span>{t.source.reading}</span>}
      {csv && <div className="source-meta-file">
        <span className="mono-label">{t.source.loaded}</span>
        <strong>{sourceName}</strong>
        <span>{csv.rows.length} {t.source.rows} / {csv.headers.length} {t.source.columns} / {formatBytes(csv.size)}</span>
      </div>}
    </div>
    {csv && <details className="preview-block">
      <summary className="preview-head">
        <span className="mono-label">{t.preview.label}</span>
        <span>{t.preview.caption}</span>
      </summary>
      <p className="preview-scroll-hint">{t.preview.scroll}</p>
      <DataTable
        csv={csv}
        labelIndex={labelIndex}
        caption={t.preview.caption}
        marker={t.preview.labelHeader}
        queryLabel={t.preview.query}
        supportLabel={t.preview.support}
        scrollLabel={t.preview.scroll}
      />
    </details>}
    {csv && <a className="source-next text-link" href="#config-heading">{t.source.next}<span aria-hidden="true">↓</span></a>}
  </section>;
}
