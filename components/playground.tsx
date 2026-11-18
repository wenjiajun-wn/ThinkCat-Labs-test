'use client';
import {Button} from './ui/primitives';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {exampleSource, nextExample, playgroundExamples} from '../lib/playground-datasets';
import {CsvError, csvLimits, displayCsvHeaders, parseCsv, type ParsedCsv} from '../lib/csv';
import {buildKumoDataset, KumoError, predictWithKumo} from '../lib/kumo-api';
import {evaluateExample, snapshotExampleEvaluation} from '../lib/playground-evaluation';
import {playgroundCopy} from '../content/playground';
import type {Locale} from '../config/i18n';
import {SourcePanel} from './playground/source-panel';
import {ResultPanel} from './playground/result-panel';
import type {PlaygroundRunState, RunSource} from './playground/result-types';
import {clearPlaygroundLanguageState, playgroundLanguageEvent, readPlaygroundLanguageState, savePlaygroundLanguageState} from '../lib/playground-language-state';

const targetColumnNames = new Set(['label', 'target', 'class', 'y', 'risk', 'outcome']);

function detectTargetColumn(headers: string[]) {
  const candidates = headers.map((name, index) => ({name, index}))
    .filter(({name}) => targetColumnNames.has(name.toLowerCase()));
  return candidates.length === 1 ? candidates[0].index : -1;
}

export function PlaygroundEntry({locale}: {locale: Locale}) {
  const params = useSearchParams();
  const id = params.get('dataset');
  const exampleId = playgroundExamples.find(item => item.id === id)?.id;
  return <Playground key={exampleId ?? 'default'} locale={locale} initialExampleId={exampleId} />;
}

export function Playground({locale, initialExampleId}:{locale: Locale; initialExampleId?: string}) {
  const t = playgroundCopy[locale];
  const [restored] = useState(() => typeof window === 'undefined' ? null : readPlaygroundLanguageState(
    window.location.pathname.replace(/^\/(zh|en)(?=\/|$)/, '/' + locale) + window.location.search,
  ));
  const [{csv, labelIndex, exampleId}, setSource] = useState<{csv: ParsedCsv | null; labelIndex: number; exampleId: string | null}>(() => {
    if (restored) return restored.source;
    const initial = playgroundExamples.find(item => item.id === initialExampleId) ?? playgroundExamples[0];
    return initial ? exampleSource(initial) : {csv: null, labelIndex: -1, exampleId: null};
  });
  const example = playgroundExamples.find(item => item.id === exampleId);
  const [reading, setReading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [runState, setRunState] = useState<PlaygroundRunState>(restored?.runState ?? {status: 'idle'});
  const [fileError, setFileError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const fileRevision = useRef(0);

  const dataset = useMemo(() => csv && labelIndex >= 0 ? buildKumoDataset(csv, labelIndex) : null, [csv, labelIndex]);
  const datasetError = csv && labelIndex < 0 ? t.errors.chooseTarget : dataset && !dataset.ok ? t.errors[dataset.code] : null;
  const running = runState.status === 'running';

  useEffect(() => {
    clearPlaygroundLanguageState(window.location.pathname + window.location.search);
    const preserve = (event: Event) => {
      const destination = (event as CustomEvent<string>).detail;
      // An in-flight request is cancelled by the existing unmount cleanup.
      // Completed results retain their original rows, source and evaluation.
      savePlaygroundLanguageState(destination, {
        source: {csv, labelIndex, exampleId},
        runState: runState.status === 'running' ? {status: 'idle'} : runState,
      });
    };
    window.addEventListener(playgroundLanguageEvent, preserve);
    return () => window.removeEventListener(playgroundLanguageEvent, preserve);
  }, [csv, labelIndex, exampleId, runState]);

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
    setSource({csv: null, labelIndex: -1, exampleId: null});
    setReading(false);
    setFileError(null);
    if (file.size > csvLimits.bytes) {
      setFileError(t.errors['too-large']);
      return;
    }
    try {
      setReading(true);
      const text = await file.text();
      if (revision !== fileRevision.current) return;
      const parsed = parseCsv(text, file.name);
      setSource({csv: parsed, labelIndex: detectTargetColumn(parsed.headers), exampleId: null});
    } catch (error) {
      if (revision !== fileRevision.current) return;
      const code = error instanceof CsvError ? error.code : 'parse';
      setFileError(t.errors[code] ?? t.errors.generic);
    } finally {
      if (revision === fileRevision.current) setReading(false);
    }
  }

  function switchExample() {
    const next = nextExample(exampleId);
    if (!next) return;
    fileRevision.current += 1;
    setPreviewKey(value => value + 1);
    cancelRun();
    setSource(exampleSource(next));
    setReading(false);
    setFileError(null);
  }

  function selectTarget(index: number) {
    if (!csv || index === labelIndex || !csv.headers[index]) return;
    cancelRun();
    fileRevision.current += 1;
    setPreviewKey(value => value + 1);
    setSource({csv, labelIndex: index, exampleId});
  }

  async function run() {
    if (!dataset?.ok || activeRequest.current) return;
    // This invocation keeps its own immutable input/source identity across all
    // awaits. Source changes cancel it; no later render supplies its answers.
    const input = dataset.data;
    const source: RunSource = example ? {kind: 'builtin', exampleId: example.id} : {kind: 'upload'};
    const controller = new AbortController();
    activeRequest.current = controller;
    setRunState({status: 'running'});
    const timeout = setTimeout(() => controller.abort(), 120_000);
    try {
      const evaluationSnapshot = example
        ? await snapshotExampleEvaluation(example, input.csv, labelIndex, input.queryIndices).catch(() => null)
        : null;
      if (activeRequest.current !== controller) return;
      const result = await predictWithKumo(input, controller.signal);
      if (activeRequest.current !== controller) return;
      clearTimeout(timeout);
      const evaluation = source.kind === 'builtin' ? await evaluateExample(evaluationSnapshot, result) : null;
      if (activeRequest.current === controller) {
        setRunState(controller.signal.aborted
          ? {status: 'error', code: 'timeout', message: t.requestErrors.timeout}
          : {status: 'success', result, source, evaluation});
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
    const header = displayCsvHeaders(csv?.headers ?? []);
    const evaluation = runState.source.kind === 'builtin' && runState.evaluation?.status === 'success' ? runState.evaluation : null;
    const actualRows = new Map(evaluation?.rows.map(row => [row.index, row]));
    const extraColumns = evaluation ? ['actual_label', 'is_correct'] : [];
    for (const name of ['source_row', 'prediction', 'probability', 'probabilities', ...extraColumns]) {
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
      ...(evaluation ? [actualRows.get(prediction.index)!.label, String(actualRows.get(prediction.index)!.isCorrect)] : []),
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
    <h1 id="workbench-title" className="visually-hidden">{t.title}</h1>
    <SourcePanel
      locale={locale}
      csv={csv}
      labelIndex={labelIndex}
      previewKey={previewKey}
      reading={reading}
      example={example}
      exampleCount={playgroundExamples.length}
      fileError={fileError}
      datasetError={datasetError}
      sourceName={example?.name[locale] ?? csv?.fileName ?? ''}
      onFile={loadFile}
      showTargetSelector={csv !== null && !example && detectTargetColumn(csv.headers) < 0}
      onTargetChange={selectTarget}
      onSample={switchExample}
      state={runState}
      onDownload={download}
    >
      <Button
        id="run-model"
        className="button button-accent run-button"
        type="button"
        onClick={run}
        disabled={running || !dataset?.ok}
        aria-busy={running}
        aria-describedby={datasetError || fileError ? 'workbench-error' : undefined}
      >
        {running ? <span className="run-spinner" aria-hidden="true" /> : <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6.75 5.5l3.75 2.5-3.75 2.5Z" /></svg>}
        {running ? t.running : t.run}
      </Button>
    </SourcePanel>
    <ResultPanel
      locale={locale}
      state={runState}
      onRetry={run}
    />
  </section>;
}
