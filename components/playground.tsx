'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {playgroundTargetColumn, sampleCsv, sampleFile} from '../lib/demo-data';
import {CsvError, csvLimits, parseCsv, type ParsedCsv} from '../lib/csv';
import {buildKumoDataset, KumoError, kumoModel, predictWithKumo} from '../lib/kumo-api';
import {playgroundCopy} from '../content/playground';
import type {Locale} from '../config/i18n';
import {SourcePanel} from './playground/source-panel';
import {ResultPanel} from './playground/result-panel';
import type {PlaygroundRunState} from './playground/result-types';

const initialSample = parseCsv(sampleCsv, sampleFile.name);
const sampleSource = {csv: initialSample, labelIndex: initialSample.headers.indexOf(playgroundTargetColumn)};
const targetColumnNames = new Set(['label', 'target', 'class', 'y', 'risk', 'outcome']);

function detectTargetColumn(headers: string[]) {
  const candidates = headers.map((name, index) => ({name, index}))
    .filter(({name}) => targetColumnNames.has(name.toLowerCase()));
  return candidates.length === 1 ? candidates[0].index : -1;
}

export function Playground({locale}:{locale: Locale}) {
  const t = playgroundCopy[locale];
  const [{csv, labelIndex}, setSource] = useState<{csv: ParsedCsv | null; labelIndex: number}>(sampleSource);
  const [previewKey, setPreviewKey] = useState(0);
  const [runState, setRunState] = useState<PlaygroundRunState>({status: 'idle'});
  const [fileError, setFileError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const fileRevision = useRef(0);

  const dataset = useMemo(() => csv && labelIndex >= 0 ? buildKumoDataset(csv, labelIndex) : null, [csv, labelIndex]);
  const datasetError = csv && labelIndex < 0 ? t.errors.chooseTarget : dataset && !dataset.ok ? t.errors[dataset.code] : null;
  const running = runState.status === 'running';

  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    fileRevision.current += 1;
  }, []);

  function cancelRun() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setRunState({status: 'idle'});
  }

  async function loadFile(file: File) {
    const revision = ++fileRevision.current;
    setPreviewKey(value => value + 1);
    cancelRun();
    setSource({csv: null, labelIndex: -1});
    setFileError(null);
    if (file.size > csvLimits.bytes) {
      setFileError(t.errors['too-large']);
      return;
    }
    try {
      const text = await file.text();
      if (revision !== fileRevision.current) return;
      const parsed = parseCsv(text, file.name);
      setSource({csv: parsed, labelIndex: detectTargetColumn(parsed.headers)});
    } catch (error) {
      if (revision !== fileRevision.current) return;
      const code = error instanceof CsvError ? error.code : 'parse';
      setFileError(t.errors[code] ?? t.errors.generic);
    }
  }

  function loadSample() {
    fileRevision.current += 1;
    setPreviewKey(value => value + 1);
    cancelRun();
    setSource(sampleSource);
    setFileError(null);
  }

  function selectTarget(index: number) {
    if (!csv || index === labelIndex || !csv.headers[index]) return;
    cancelRun();
    setSource({csv, labelIndex: index});
  }

  async function run() {
    if (!dataset?.ok || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setRunState({status: 'running'});
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      const heading = document.getElementById('result-heading');
      heading?.focus({preventScroll: true});
      heading?.closest('.result-panel')?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
    });
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const result = await predictWithKumo(dataset.data, controller.signal);
      if (activeRequest.current === controller) {
        setRunState(controller.signal.aborted
          ? {status: 'error', code: 'timeout', message: t.requestErrors.timeout}
          : {status: 'success', result});
      }
    } catch (error) {
      if (activeRequest.current === controller) {
        const code = controller.signal.aborted ? 'timeout' : error instanceof KumoError ? error.code : 'unavailable';
        setRunState({status: 'error', code, message: t.requestErrors[code]});
      }
    } finally {
      clearTimeout(timeout);
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }

  function backToData() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('run-model')?.focus({preventScroll: true});
    document.querySelector('.source-panel')?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
  }

  function download() {
    if (runState.status !== 'success') return;
    const escape = (value: string | number) => {
      const text = String(value);
      // Prevent CSV values from being interpreted as formulas by spreadsheet apps.
      const safe = typeof value === 'string' && /^[\s]*[=+@-]|^[\t\r\n]/.test(text) && !Number.isFinite(Number(text))
        ? "'" + text
        : text;
      return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const header = [...(csv?.headers ?? [])];
    for (const name of ['source_row', 'kumo_prediction', 'kumo_probability', 'kumo_probabilities']) {
      let unique = name;
      for (let suffix = 2; header.includes(unique); suffix += 1) unique = `${name}_${suffix}`;
      header.push(unique);
    }
    const rows = runState.result.predictions.map(prediction => [
      ...prediction.cells,
      prediction.sourceLine,
      prediction.label,
      prediction.probability,
      JSON.stringify(prediction.probabilities),
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

  return <section className="workbench" aria-labelledby="workbench-title">
    <span className="visually-hidden" role="status">
      {runState.status === 'success' && `${t.states.successTitle}. ${t.results.predictionCount}: ${runState.result.predictions.length}`}
    </span>
    <header className="workbench-topbar">
      <h1 id="workbench-title" className="visually-hidden">{t.title}</h1>
      <h2 className="workbench-title">{t.source.title}</h2>
      <div className="workbench-model">
        <span>{kumoModel}</span>
        <span className="workbench-status">{t.liveStatus}</span>
      </div>
    </header>
    <SourcePanel
      locale={locale}
      csv={csv}
      labelIndex={labelIndex}
      previewKey={previewKey}
      isSample={csv === initialSample}
      fileError={fileError}
      datasetError={datasetError}
      sourceName={csv === initialSample ? t.source.sampleName : csv?.fileName ?? ''}
      onFile={loadFile}
      showTargetSelector={csv !== null && csv !== initialSample && detectTargetColumn(csv.headers) < 0}
      onTargetChange={selectTarget}
      onSample={loadSample}
    >
      <button
        id="run-model"
        className="button button-accent run-button"
        type="button"
        onClick={run}
        disabled={running || !dataset?.ok}
        aria-busy={running}
        aria-describedby={datasetError || fileError ? 'workbench-error' : 'run-model-notice'}
      >
        {running ? <span className="run-spinner" aria-hidden="true" /> : <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6.75 5.5l3.75 2.5-3.75 2.5Z" /></svg>}
        {running ? t.running : t.run}
      </button>
    </SourcePanel>
    <ResultPanel
      locale={locale}
      state={runState}
      model={runState.status === 'success' ? runState.result.model : kumoModel}
      headers={csv?.headers ?? []}
      labelIndex={labelIndex}
      onDownload={download}
      onRetry={run}
      onBackToData={backToData}
    />
  </section>;
}
