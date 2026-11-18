import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const {outputText} = ts.transpileModule(readFileSync('lib/evaluation.ts', 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022},
});
const {evaluateClassification} = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

function fixture(count = 8, correct = 7, classes = ['No', 'Yes']) {
  const sourceRecords = Array.from({length: count + 10}, (_, index) => index * 7 + 3);
  const queryIndices = Array.from({length: count}, (_, index) => index + 10);
  const snapshot = {datasetId: 'test', datasetVersion: 'fixed-version', targetColumn: 'outcome', queryIndices, sourceRecords, classes};
  const queryLabels = queryIndices.map((index, ordinal) => ({index, sourceRecord: sourceRecords[index], label: classes[ordinal % classes.length]}));
  const spec = {datasetId: snapshot.datasetId, datasetVersion: snapshot.datasetVersion, targetColumn: snapshot.targetColumn, queryLabels};
  const predictions = queryLabels.map(({index, sourceRecord, label}, ordinal) => ({index, sourceLine: sourceRecord, label: ordinal < correct ? label : classes[(ordinal + 1) % classes.length]}));
  return {snapshot, spec, predictions};
}

function unavailable(result, reason) {
  assert.equal(result.status, 'unavailable');
  if (reason) assert.equal(result.reason, reason);
  for (const key of ['accuracy', 'correctCount', 'totalCount', 'rows']) assert(!Object.hasOwn(result, key), `Invalid evaluation must not publish ${key}`);
}

for (const [count, correct, accuracy] of [[8, 7, .875], [20, 17, .85], [8, 8, 1], [8, 0, 0]]) {
  test(`${correct}/${count} independent query labels yields ${accuracy * 100}% accuracy`, () => {
    const {snapshot, spec, predictions} = fixture(count, correct);
    const result = evaluateClassification(snapshot, spec, predictions);
    assert.equal(result.status, 'success');
    assert.equal(result.accuracy, accuracy);
    assert.equal(result.correctCount, correct);
    assert.equal(result.totalCount, count);
    assert.equal(result.rows.filter(row => row.isCorrect).length, correct);
    assert(result.rows.every(row => snapshot.queryIndices.includes(row.index)));
  });
}

test('multiclass labels preserve exact case and valid zero/false strings', () => {
  const {snapshot, spec, predictions} = fixture(12, 12, ['0', 'false', 'Bad', 'Good', 'No', 'no']);
  const result = evaluateClassification(snapshot, spec, predictions);
  assert.equal(result.accuracy, 1);
  predictions[4].label = 'no';
  assert.equal(evaluateClassification(snapshot, spec, predictions).correctCount, 11);
});

test('shuffled results map through request index and non-contiguous original record IDs, never order', () => {
  const {snapshot, spec, predictions} = fixture();
  const expected = evaluateClassification(snapshot, spec, predictions);
  predictions.reverse();
  spec.queryLabels.reverse();
  assert.deepEqual(evaluateClassification(snapshot, spec, predictions), expected);
});

test('two identical feature vectors with different records keep separate actual labels', () => {
  const {snapshot, spec, predictions} = fixture(2, 2);
  // The evaluator has no feature-based lookup; duplicate values cannot substitute identity.
  const identicalFeatures = [{measurement: 1}, {measurement: 1}];
  assert.deepEqual(identicalFeatures[0], identicalFeatures[1]);
  assert.notEqual(spec.queryLabels[0].label, spec.queryLabels[1].label);
  assert.equal(evaluateClassification(snapshot, spec, predictions).accuracy, 1);
  [predictions[0].label, predictions[1].label] = [predictions[1].label, predictions[0].label];
  assert.equal(evaluateClassification(snapshot, spec, predictions).accuracy, 0);
});

test('evaluation leaves input records, answers and prediction objects untouched', () => {
  const input = fixture();
  const before = structuredClone(input);
  for (const row of input.spec.queryLabels) Object.freeze(row);
  Object.freeze(input.spec.queryLabels);
  for (const prediction of input.predictions) Object.freeze(prediction);
  Object.freeze(input.predictions);
  evaluateClassification(input.snapshot, input.spec, input.predictions);
  assert.deepEqual(input, before);
});

test('zero query rows and absent metadata never produce effective scores', () => {
  const {snapshot, spec, predictions} = fixture(0, 0);
  unavailable(evaluateClassification(snapshot, spec, predictions), 'empty-holdout');
  unavailable(evaluateClassification(snapshot, null, predictions), 'missing-spec');
  unavailable(evaluateClassification(snapshot, undefined, predictions), 'missing-spec');
});

for (const key of ['datasetId', 'datasetVersion', 'targetColumn']) {
  test(`incompatible ${key} cannot reuse otherwise correct answers`, () => {
    const {snapshot, spec, predictions} = fixture();
    spec[key] += '-other';
    unavailable(evaluateClassification(snapshot, spec, predictions), 'version-mismatch');
  });
}

const truthMutations = {
  missing: spec => spec.queryLabels.pop(),
  duplicate: spec => {spec.queryLabels[1] = {...spec.queryLabels[0]};},
  unknown: spec => {spec.queryLabels[0].index = 0;},
  fractional: spec => {spec.queryLabels[0].index += .5;},
  'wrong source record': spec => {spec.queryLabels[0].sourceRecord += 1;},
  'unknown class': spec => {spec.queryLabels[0].label = 'unknown';},
  'numeric zero coercion': spec => {spec.queryLabels[0].label = 0;},
  'null entry': spec => {spec.queryLabels[0] = null;},
  'missing array': spec => {delete spec.queryLabels;},
};
for (const [name, mutate] of Object.entries(truthMutations)) {
  test(`ground truth ${name} rejects the entire metric`, () => {
    const {snapshot, spec, predictions} = fixture();
    mutate(spec);
    unavailable(evaluateClassification(snapshot, spec, predictions), 'invalid-truth');
  });
}

const predictionMutations = {
  missing: predictions => predictions.pop(),
  extra: predictions => predictions.push({...predictions[0]}),
  duplicate: predictions => {predictions[1] = {...predictions[0]};},
  'context index': predictions => {predictions[0].index = 0;},
  'out of range index': predictions => {predictions[0].index = 1000;},
  'source record as index': predictions => {predictions[0].index = predictions[0].sourceLine;},
  'wrong source record': predictions => {predictions[0].sourceLine += 1;},
  'unknown class': predictions => {predictions[0].label = 'unknown';},
  'boolean coercion': predictions => {predictions[0].label = false;},
  'null entry': predictions => {predictions[0] = null;},
};
for (const [name, mutate] of Object.entries(predictionMutations)) {
  test(`prediction ${name} rejects the entire metric instead of reducing the denominator`, () => {
    const {snapshot, spec, predictions} = fixture();
    mutate(predictions);
    unavailable(evaluateClassification(snapshot, spec, predictions), 'invalid-predictions');
  });
}

const snapshotMutations = {
  'duplicate query': snapshot => {snapshot.queryIndices[1] = snapshot.queryIndices[0];},
  'invalid query': snapshot => {snapshot.queryIndices[0] = -1;},
  'string index': snapshot => {snapshot.queryIndices[0] = '10';},
  'missing record': snapshot => {snapshot.sourceRecords.pop();},
  'duplicate source record': snapshot => {snapshot.sourceRecords[1] = snapshot.sourceRecords[0];},
  'invalid source record': snapshot => {snapshot.sourceRecords[0] = 0;},
  'single class': snapshot => {snapshot.classes = ['No'];},
  'duplicate class': snapshot => {snapshot.classes.push('No');},
  'missing version': snapshot => {snapshot.datasetVersion = '';},
};
for (const [name, mutate] of Object.entries(snapshotMutations)) {
  test(`invalid snapshot (${name}) never yields a metric`, () => {
    const {snapshot, spec, predictions} = fixture();
    mutate(snapshot);
    unavailable(evaluateClassification(snapshot, spec, predictions), 'invalid-snapshot');
  });
}
