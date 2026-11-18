import type {PlaygroundExample} from './playground-datasets';
import type {ParsedCsv} from './csv';
import type {KumoResult} from './kumo-api';
import type {ClassificationEvaluation, EvaluationSnapshot} from './evaluation';

// Hash the actual run input, not just the registry ID. No held-out answers are
// needed here. The offline preparation script uses the same key order/encoding.
export async function snapshotExampleEvaluation(
  example: PlaygroundExample,
  csv: ParsedCsv,
  labelIndex: number,
  queryIndices: readonly number[],
): Promise<EvaluationSnapshot> {
  const queries = new Set(queryIndices);
  const supportIndices = csv.rows.flatMap((_, index) => queries.has(index) ? [] : [index]);
  const target = csv.headers[labelIndex];
  const versionInput = JSON.stringify({
    sourceSha256: example.data.sourceSha256,
    headers: csv.headers,
    target,
    rows: csv.rows,
    sourceRecords: csv.rowLineNumbers,
    supportIndices,
    queryIndices,
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(versionInput));
  return {
    datasetId: example.id,
    datasetVersion: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(''),
    targetColumn: target,
    queryIndices: [...queryIndices],
    sourceRecords: [...csv.rowLineNumbers],
    classes: [...new Set(supportIndices.map(index => csv.rows[index][labelIndex].trim()))],
  };
}

export async function evaluateExample(
  snapshot: EvaluationSnapshot | null,
  result: KumoResult,
): Promise<ClassificationEvaluation> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!snapshot) return {status: 'unavailable', reason: 'metadata-unavailable'};
    // Load answers only after inference. They never enter csv or dataset.request.
    const modules = await Promise.race([
      Promise.all([
      import('../content/datasets/evaluation.json'),
      import('./evaluation'),
      ]),
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), 5000); }),
    ]);
    if (!modules) return {status: 'unavailable', reason: 'metadata-unavailable'};
    const [{default: specs}, {evaluateClassification}] = modules;
    const spec = specs[snapshot.datasetId as keyof typeof specs];
    if (!spec) return {status: 'unavailable', reason: 'metadata-unavailable'};
    return evaluateClassification(snapshot, spec, result.predictions);
  } catch {
    // An evaluation failure must not discard a valid model prediction or report
    // a misleading inference-service connection error.
    return {status: 'unavailable', reason: 'metadata-unavailable'};
  } finally {
    clearTimeout(timer);
  }
}
