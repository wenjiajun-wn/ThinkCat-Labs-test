'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {sampleCsv, sampleFile} from '../lib/demo-data';
import {CsvError, csvLimits, detectLabelColumn, parseCsv, type ParsedCsv} from '../lib/csv';
import {buildDataset, runLocalDemo, type DemoParams, type DemoResult} from '../lib/demo-model';
import {playgroundCopy} from '../content/playground';
import type {Locale} from '../config/i18n';
import {SourcePanel} from './playground/source-panel';
import {ConfigPanel} from './playground/config-panel';
import {ResultPanel} from './playground/result-panel';

const initialSample = parseCsv(sampleCsv, sampleFile.name);

type RunState =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'error'; message: string}
  | {status: 'success'; result: DemoResult};

export function Playground({locale}:{locale: Locale}) {
  const t = playgroundCopy[locale];
  const [csv, setCsv] = useState<ParsedCsv | null>(initialSample);
  const [labelIndex, setLabelIndex] = useState(() => detectLabelColumn(initialSample.headers));
  const [params, setParams] = useState<DemoParams>({neighbors: 3, metric: 'euclidean', normalize: true});
  const [runState, setRunState] = useState<RunState>({status: 'idle'});
  const [fileError, setFileError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRevision = useRef(0);

  const dataset = useMemo(() => csv ? buildDataset(csv, labelIndex) : null, [csv, labelIndex]);
  const datasetError = dataset && !dataset.ok ? t.errors[dataset.code] : null;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    fileRevision.current += 1;
  }, []);

  function cancelRun() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRunState({status: 'idle'});
  }

  async function loadFile(file: File) {
    const revision = ++fileRevision.current;
    cancelRun();
    setCsv(null);
    setFileError(null);
    if (file.size > csvLimits.bytes) {
      setFileError(t.errors['too-large']);
      return;
    }
    try {
      const text = await file.text();
      if (revision !== fileRevision.current) return;
      const parsed = parseCsv(text, file.name);
      setCsv(parsed);
      setLabelIndex(detectLabelColumn(parsed.headers));
    } catch (error) {
      if (revision !== fileRevision.current) return;
      const code = error instanceof CsvError ? error.code : 'parse';
      setFileError(t.errors[code] ?? t.errors.generic);
    }
  }

  function loadSample() {
    fileRevision.current += 1;
    cancelRun();
    setCsv(initialSample);
    setLabelIndex(detectLabelColumn(initialSample.headers));
    setFileError(null);
  }

  function updateLabel(index: number) {
    cancelRun();
    setLabelIndex(index);
  }

  function updateParams(next: DemoParams) {
    if (runState.status === 'success') setRunState({status: 'idle'});
    setParams(next);
  }

  function run() {
    if (!dataset?.ok || runState.status === 'running') return;
    if (timer.current) clearTimeout(timer.current);
    setRunState({status: 'running'});
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      const heading = document.getElementById('result-heading');
      heading?.focus({preventScroll: true});
      heading?.closest('.result-panel')?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
    });
    timer.current = setTimeout(() => {
      try {
        const result = runLocalDemo(dataset.data, params);
        setRunState({status: 'success', result});
      } catch {
        setRunState({status: 'error', message: t.states.errorBody});
      }
      timer.current = null;
    }, 900);
  }

  function download() {
    if (runState.status !== 'success') return;
    const escape = (value: string | number) => {
      const text = String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const header = [...(csv?.headers ?? []), 'demo_prediction', 'demo_agreement', 'demo_note'];
    const rows = runState.result.predictions.map(prediction => [
      ...prediction.cells,
      prediction.label,
      `${Math.round(prediction.confidence * 100)}%`,
      'DEMO: local nearest-neighbor, not model output',
    ]);
    const content = [header, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], {type: 'text/csv;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = t.results.downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="workbench" aria-label={t.title}>
    <span className="visually-hidden" role="status">
      {runState.status === 'running' && t.states.loadingTitle}
      {runState.status === 'success' && `${t.states.successTitle}. ${t.results.predictionCount}: ${runState.result.predictions.length}`}
      {runState.status === 'error' && runState.message}
    </span>
    <div className="workbench-topbar">
      <div className="workbench-notice">
        <span className="demo-badge">{t.config.demoTag}</span>
        <p>{t.demoNotice}</p>
      </div>
      <div className="workbench-status">
        <span className="signal-dot" aria-hidden="true" />
        <span className="mono-label">{t.states.liveUnavailable}</span>
      </div>
    </div>
    <div className="workbench-grid">
      <SourcePanel
        locale={locale}
        csv={csv}
        labelIndex={labelIndex}
        fileError={fileError}
        sourceName={csv === initialSample ? t.source.sampleName : csv?.fileName ?? ''}
        onFile={loadFile}
        onSample={loadSample}
      />
      <ConfigPanel
        locale={locale}
        csv={csv}
        labelIndex={labelIndex}
        datasetError={datasetError}
        params={params}
        running={runState.status === 'running'}
        hasResult={runState.status === 'success'}
        onLabelChange={updateLabel}
        onParams={updateParams}
        onRun={run}
      />
      <ResultPanel
        locale={locale}
        state={runState}
        onDownload={download}
        onRetry={() => {
          cancelRun();
          setFileError(null);
          window.requestAnimationFrame(() => document.getElementById('label-select')?.focus());
        }}
      />
    </div>
  </section>;
}
