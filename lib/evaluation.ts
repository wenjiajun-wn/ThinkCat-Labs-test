import type {KumoResult} from './kumo-api';

/** Immutable identity of the dataset submitted by this particular run. */
export type EvaluationSnapshot = {
  datasetId: string;
  datasetVersion: string;
  targetColumn: string;
  queryIndices: readonly number[];
  sourceRecords: readonly number[];
  classes: readonly string[];
};

export type ExampleEvaluationSpec = {
  datasetId: string;
  datasetVersion: string;
  targetColumn: string;
  queryLabels: readonly {index: number; sourceRecord: number; label: string}[];
};

export type ClassificationEvaluation =
  | {
      status: 'success';
      accuracy: number;
      correctCount: number;
      totalCount: number;
      rows: {index: number; sourceRecord: number; label: string; predictedLabel: string; isCorrect: boolean}[];
    }
  | {
      status: 'unavailable';
      reason: 'metadata-unavailable' | 'missing-spec' | 'version-mismatch' | 'invalid-snapshot' | 'empty-holdout' | 'invalid-truth' | 'invalid-predictions';
    };

type Prediction = Pick<KumoResult['predictions'][number], 'index' | 'sourceLine' | 'label'>;

/**
 * Evaluate the entire declared holdout or return no metric at all.
 * Probabilities and context labels are deliberately absent from this API.
 * These checks also cover malformed static metadata at runtime.
 */
export function evaluateClassification(
  snapshot: EvaluationSnapshot,
  spec: ExampleEvaluationSpec | null | undefined,
  predictions: readonly Prediction[],
): ClassificationEvaluation {
  if (!spec || typeof spec !== 'object') return {status: 'unavailable', reason: 'missing-spec'};
  if (!snapshot.datasetId || !snapshot.datasetVersion || !snapshot.targetColumn ||
      !Array.isArray(snapshot.queryIndices) || !Array.isArray(snapshot.sourceRecords) || !Array.isArray(snapshot.classes)) {
    return {status: 'unavailable', reason: 'invalid-snapshot'};
  }
  if (spec.datasetId !== snapshot.datasetId || spec.datasetVersion !== snapshot.datasetVersion || spec.targetColumn !== snapshot.targetColumn) {
    return {status: 'unavailable', reason: 'version-mismatch'};
  }
  if (!snapshot.queryIndices.length) return {status: 'unavailable', reason: 'empty-holdout'};

  const expected = new Set(snapshot.queryIndices);
  const classes = new Set(snapshot.classes);
  if (expected.size !== snapshot.queryIndices.length || classes.size !== snapshot.classes.length || classes.size < 2 || classes.size > 10 ||
      snapshot.classes.some(label => typeof label !== 'string' || !label.length) ||
      snapshot.sourceRecords.some(record => !Number.isSafeInteger(record) || record < 1) ||
      new Set(snapshot.sourceRecords).size !== snapshot.sourceRecords.length ||
      snapshot.queryIndices.some(index => !Number.isSafeInteger(index) || index < 0 || index >= snapshot.sourceRecords.length)) {
    return {status: 'unavailable', reason: 'invalid-snapshot'};
  }
  if (!Array.isArray(spec.queryLabels) || spec.queryLabels.length !== expected.size) {
    return {status: 'unavailable', reason: 'invalid-truth'};
  }

  const truth = new Map<number, string>();
  for (const row of spec.queryLabels) {
    if (!row || !Number.isSafeInteger(row.index) || !expected.has(row.index) || truth.has(row.index) ||
        row.sourceRecord !== snapshot.sourceRecords[row.index] || typeof row.label !== 'string' || !classes.has(row.label)) {
      return {status: 'unavailable', reason: 'invalid-truth'};
    }
    truth.set(row.index, row.label);
  }
  if (!Array.isArray(predictions) || predictions.length !== expected.size) {
    return {status: 'unavailable', reason: 'invalid-predictions'};
  }
  const seen = new Set<number>();
  const rows: Extract<ClassificationEvaluation, {status: 'success'}>['rows'] = [];
  for (const prediction of predictions) {
    if (!prediction || !Number.isSafeInteger(prediction.index) || !expected.has(prediction.index) || seen.has(prediction.index) ||
        prediction.sourceLine !== snapshot.sourceRecords[prediction.index] || typeof prediction.label !== 'string' || !classes.has(prediction.label)) {
      return {status: 'unavailable', reason: 'invalid-predictions'};
    }
    seen.add(prediction.index);
    // Full coverage and uniqueness were checked above; '0' and 'false' stay strings.
    const label = truth.get(prediction.index)!;
    rows.push({index: prediction.index, sourceRecord: prediction.sourceLine, label, predictedLabel: prediction.label, isCorrect: prediction.label === label});
  }
  rows.sort((a, b) => a.index - b.index);
  const correctCount = rows.filter(row => row.isCorrect).length;
  return {status: 'success', accuracy: correctCount / expected.size, correctCount, totalCount: expected.size, rows};
}
