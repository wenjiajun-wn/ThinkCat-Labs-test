import type {ParsedCsv} from './csv';

export const kumoModel = 'Kumo Tabular Medium';

type KumoRow = Record<string, number | string | null>;
export type KumoDatasetError = 'row-count' | 'no-features' | 'non-numeric' | 'support-count' | 'query-count' | 'class-count';
export type KumoRequestError = 'payload-too-large' | 'rate-limited' | 'rejected' | 'unavailable' | 'invalid-response' | 'timeout';

type Dataset = {
  request: {rows: KumoRow[]; target_column: string};
  queryIndices: number[];
  supportCount: number;
  csv: ParsedCsv;
};

export type KumoResult = {
  elapsedMs?: number;
  requestMs?: number;
  timing?: 'browser' | 'server' | 'request' | 'recordedGpu' | 'recordedRequest' | 'recordedNeighbors';
  model: string;
  predictions: {
    index: number;
    sourceLine: number;
    cells: string[];
    label: string;
    probability: number;
    probabilities: Record<string, number>;
  }[];
  distribution: {label: string; count: number}[];
  averageProbability: number;
  supportCount: number;
};

export class KumoError extends Error {
  constructor(public readonly code: KumoRequestError) {
    super(code);
  }
}

export function buildKumoDataset(csv: ParsedCsv, labelIndex: number):
  {ok: true; data: Dataset} | {ok: false; code: KumoDatasetError} {
  if (csv.rows.length < 20 || csv.rows.length > 10000) return {ok: false, code: 'row-count'};
  const target = csv.headers[labelIndex];
  const features = csv.headers.filter((_, index) => index !== labelIndex);
  if (!target || features.length < 1 || features.length > 30) return {ok: false, code: 'no-features'};

  const rows: KumoRow[] = [];
  const queryIndices: number[] = [];
  const classes = new Set<string>();
  for (const [index, cells] of csv.rows.entries()) {
    const row: KumoRow = Object.create(null);
    const label = cells[labelIndex].trim();
    for (const [column, header] of csv.headers.entries()) {
      if (column === labelIndex) {
        row[header] = label || null;
      } else {
        const value = Number(cells[column]);
        if (!cells[column].trim() || !Number.isFinite(value)) return {ok: false, code: 'non-numeric'};
        row[header] = value;
      }
    }
    if (label) classes.add(label);
    else queryIndices.push(index);
    rows.push(row);
  }

  const supportCount = rows.length - queryIndices.length;
  if (supportCount < 10) return {ok: false, code: 'support-count'};
  if (queryIndices.length < 1 || queryIndices.length > 50) return {ok: false, code: 'query-count'};
  if (classes.size < 2 || classes.size > 10) return {ok: false, code: 'class-count'};
  return {ok: true, data: {request: {rows, target_column: target}, queryIndices, supportCount, csv}};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidResponse(): never {
  throw new KumoError('invalid-response');
}

function decodeResult(body: unknown, dataset: Dataset, expectedModel: string): KumoResult {
  if (!isRecord(body)) invalidResponse();
  const {model, row_indices, predictions, probabilities, classes} = body;
  const expected = new Set(dataset.queryIndices);
  if (model !== expectedModel ||
      !Array.isArray(row_indices) || !Array.isArray(predictions) || !Array.isArray(probabilities) ||
      row_indices.length !== expected.size || predictions.length !== expected.size || probabilities.length !== expected.size ||
      !Array.isArray(classes) || classes.length < 2 || classes.length > 10 ||
      classes.some(label => typeof label !== 'string') || new Set(classes).size !== classes.length) invalidResponse();

  const counts = new Map<string, number>(classes.map(label => [label, 0]));
  const mapped = row_indices.map((index, position) => {
    const label = predictions[position];
    const scores: unknown = probabilities[position];
    if (typeof index !== 'number' || !expected.delete(index) || typeof label !== 'string' ||
        !counts.has(label) || !isRecord(scores)) invalidResponse();

    const rowProbabilities: Record<string, number> = Object.create(null);
    for (const category of counts.keys()) {
      const score = scores[category];
      if (!Object.hasOwn(scores, category) || typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) {
        invalidResponse();
      }
      rowProbabilities[category] = score;
    }
    const total = Object.values(rowProbabilities).reduce((sum, score) => sum + score, 0);
    if (Math.abs(total - 1) > 0.01) invalidResponse();
    counts.set(label, (counts.get(label) ?? 0) + 1);
    return {
      index,
      sourceLine: dataset.csv.rowLineNumbers[index],
      cells: dataset.csv.rows[index],
      label,
      probability: rowProbabilities[label],
      probabilities: rowProbabilities,
    };
  }).sort((a, b) => a.index - b.index);

  return {
    model,
    predictions: mapped,
    distribution: [...counts].map(([label, count]) => ({label, count})).sort((a, b) => b.count - a.count),
    averageProbability: mapped.reduce((sum, row) => sum + row.probability, 0) / mapped.length,
    supportCount: dataset.supportCount,
  };
}

async function predictRemote(dataset: Dataset, signal: AbortSignal, model: string): Promise<KumoResult> {
  const started = performance.now();
  const endpoint = '/api/predict';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify(dataset.request),
    signal,
  });
  if (response.status === 413) throw new KumoError('payload-too-large');
  if (response.status === 429) throw new KumoError('rate-limited');
  if (response.status === 408 || response.status === 504) throw new KumoError('timeout');
  if (response.status === 400 || response.status === 422) throw new KumoError('rejected');
  if (!response.ok) throw new KumoError('unavailable');

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    invalidResponse();
  }
  const requestMs = performance.now() - started;
  const elapsed = isRecord(body) ? body.elapsedMs : null;
  const serverTimed = typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= 0;
  return {...decodeResult(body, dataset, model), requestMs, elapsedMs: serverTimed ? elapsed : requestMs,
    timing: serverTimed ? 'server' : 'request'};
}

export async function predictWithXGBoost(dataset: Dataset, signal: AbortSignal): Promise<KumoResult> {
  signal.throwIfAborted();
  const worker = new Worker('/workers/xgboost.js', {type: 'module'});
  let abort: (() => void) | undefined;
  try {
    const body = await new Promise<Record<string, unknown>>((resolve, reject) => {
      abort = () => reject(new KumoError('timeout'));
      signal.addEventListener('abort', abort, {once: true});
      worker.onerror = worker.onmessageerror = () => reject(new KumoError('invalid-response'));
      worker.onmessage = event => resolve(event.data);
      worker.postMessage(dataset.request);
    });
    return {...decodeResult(body, dataset, 'XGBoost'), elapsedMs: Number(body.elapsedMs), timing: 'browser'};
  } finally {
    if (abort) signal.removeEventListener('abort', abort);
    worker.terminate();
  }
}

export function predictWithKumo(dataset: Dataset, signal: AbortSignal) {
  return predictRemote(dataset, signal, kumoModel);
}

export const liveApiEnabled = process.env.NEXT_PUBLIC_USE_LIVE_API === '1';

export async function runPlaygroundPrediction(dataset: Dataset, signal: AbortSignal,
  model: 'primary' | 'baseline', exampleId: string | null, datasetVersion?: string): Promise<KumoResult> {
  if (model === 'baseline') return predictWithXGBoost(dataset, AbortSignal.any([signal, AbortSignal.timeout(120_000)]));
  if (liveApiEnabled) {
    const timeout = AbortSignal.timeout(120_000);
    try {
      return await predictWithKumo(dataset, AbortSignal.any([signal, timeout]));
    } catch (error) {
      signal.throwIfAborted();
      if (!exampleId) throw timeout.aborted ? new KumoError('timeout') : error;
    }
  }
  if (!exampleId) throw new KumoError('unavailable');
  const [{default: recordings}] = await Promise.all([
    import('../content/playground-precomputed.json'),
    new Promise(resolve => setTimeout(resolve, 200)),
  ]);
  signal.throwIfAborted();
  const entry = recordings[exampleId as keyof typeof recordings];
  if (!entry || entry.datasetVersion !== datasetVersion) invalidResponse();
  const saved = entry.thinkcat;
  const local = saved.source === 'precomputed';
  const expectedModel = local ? '5-NN' : kumoModel;
  const result = decodeResult(saved, dataset, expectedModel);
  const timing = local ? 'recordedNeighbors'
    : saved.timing === 'request' ? 'recordedRequest' : 'recordedGpu';
  return {...result, elapsedMs: saved.elapsedMs, timing};
}
