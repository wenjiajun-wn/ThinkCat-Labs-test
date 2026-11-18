import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';

async function load(file) {
  const {outputText} = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022},
  });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const {parseCsv, displayCsvHeaders} = await load('lib/csv.ts');
const {buildKumoDataset, predictWithKumo, kumoModel} = await load('lib/kumo-api.ts');
const {sampleCsv} = await load('lib/demo-data.ts');
const {evaluateClassification} = await load('lib/evaluation.ts');
const {snapshotExampleEvaluation} = await load('lib/playground-evaluation.ts');

test('large CSV preserves all context rows and original query indices within the tested limit', () => {
  const makeCsv = count => 'value,target\n' + Array.from({length: count}, (_, index) =>
    `${index},${index >= count - 50 ? '' : index % 2 ? 'Yes' : 'No'}`).join('\n');
  for (const count of [1000, 2000, 5000, 10000]) {
    const csv = parseCsv(makeCsv(count), 'large.csv');
    const built = buildKumoDataset(csv, 1);
    assert.equal(built.ok, true);
    assert.equal(built.data.request.rows.length, count);
    assert.equal(built.data.supportCount, count - 50);
    assert.deepEqual(built.data.queryIndices, Array.from({length: 50}, (_, i) => count - 50 + i));
    assert(built.data.request.rows.slice(-50).every(row => row.target === null));
  }
  assert.throws(() => parseCsv(makeCsv(10001), 'large.csv'), error => error.code === 'too-many-rows');
  const csv = parseCsv(makeCsv(10000), 'large.csv');
  csv.rows.push(['10000', 'Yes']);
  assert.deepEqual(buildKumoDataset(csv, 1), {ok: false, code: 'row-count'});
  csv.rows.pop();
  csv.rows[0][1] = '';
  assert.deepEqual(buildKumoDataset(csv, 1), {ok: false, code: 'query-count'});
});

test('prediction display headers omit the legacy prefix without mutating inputs or creating duplicates', () => {
  const headers = ['kumo_prediction', 'kumo_probability', 'kumo_probabilities', 'prediction', 'kumo_feature'];
  assert.deepEqual(displayCsvHeaders(headers), ['prediction', 'probability', 'probabilities', 'prediction_2', 'kumo_feature']);
  assert.equal(headers[0], 'kumo_prediction');
  assert.deepEqual(displayCsvHeaders(['kumo_prediction_2']), ['prediction_2']);
});

const exampleIds = readdirSync('content/datasets').filter(name => /^\d+\.json$/.test(name)).map(name => name.slice(0, -5));
const originalSplits = {
  '46915': [5000, 4950, 50], '46920': [4000, 3950, 50], '46924': [8000, 7950, 50],
  '46927': [1480, 1430, 50], '46938': [1723, 1673, 50], '46964': [6497, 6447, 50],
  '46913': [40, 32, 8], '46941': [60, 48, 12], '46979': [80, 72, 8],
  '46935': [30, 26, 4], '46910': [10000, 9950, 50], '46918': [120, 108, 12],
  '46921': [150, 135, 15], '46947': [180, 162, 18], '46956': [210, 189, 21],
  '46940': [240, 216, 24], '46960': [300, 270, 30], '46932': [400, 360, 40],
  '46930': [480, 432, 48], '46919': [260, 234, 26], '46906': [35, 25, 10],
};

function versionOf(source) {
  const {sourceSha256, headers, target, rows, sourceRecords, supportIndices, queryIndices} = source;
  return createHash('sha256').update(JSON.stringify({sourceSha256, headers, target, rows, sourceRecords, supportIndices, queryIndices})).digest('hex');
}
test('all 21 examples retain distinct row counts and valid native column counts', () => {
  const examples = exampleIds.map(id => JSON.parse(readFileSync(`content/datasets/${id}.json`, 'utf8')));
  assert.equal(examples.length, 21);
  assert.equal(new Set(examples.map(data => data.rows.length)).size, examples.length);
  // Steel naturally has six numeric features, as does maternal health; do not drop real fields to force uniqueness.
  assert.equal(examples.find(data => data.id === '46906').headers.length, 7);
  assert(examples.every(data => data.headers.length >= 2 && data.headers.length <= 31));
});
test('home examples reference registered real datasets', async () => {
  const {applicationDatasets} = await load('content/applications.ts');
  assert.deepEqual(Object.values(applicationDatasets), ['46919', '46956', '46906']);
  for (const id of Object.values(applicationDatasets)) assert(exampleIds.includes(id));
});
test('fourteen home application links use registered datasets with accurate classification semantics', async () => {
  const {applicationDatasets, additionalApplications, applicationsCopy} = await load('content/applications.ts');
  const source = ts.createSourceFile('registry.ts', readFileSync('lib/playground-datasets.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  let registry;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    registry ??= statement.declarationList.declarations.find(item => item.name.getText(source) === 'playgroundExamples')?.initializer;
  }
  assert(registry && ts.isArrayLiteralExpression(registry), 'Use the actual Playground registry');
  const registered = registry.elements.map(item => item.properties.find(property => property.name?.getText(source).replaceAll('"', '').replaceAll("'", '') === 'id')?.initializer.text);
  assert.deepEqual(additionalApplications.map(item => item.datasetId), ['46910', '46915', '46920', '46924', '46927', '46938', '46964', '46947', '46979', '46930', '46960']);
  const ids = [...Object.values(applicationDatasets), ...additionalApplications.map(item => item.datasetId)];
  assert.equal(new Set(ids).size, 14);
  for (const id of ids) assert(registered.includes(id), `Unregistered home example ${id}`);
  const expectedTargets = {bank: 'SubscribeTermDeposit', telecom: 'CustomerChurned', airline: 'satisfaction', shipping: 'ArrivedLate', fitness: 'attended', customer: 'bad_client_target', wine: 'median_wine_quality', commerce: 'Revenue', software: 'defects', food: 'Contaminated', education: 'AcademicOutcome'};
  for (const application of additionalApplications) {
    const data = JSON.parse(readFileSync(`content/datasets/${application.datasetId}.json`, 'utf8'));
    assert.equal(data.target, expectedTargets[application.id]);
    const labels = [...new Set(data.supportIndices.map(i => data.rows[i][data.headers.indexOf(data.target)]))].sort();
    assert.equal(labels.length, application.task === 'binary' ? 2 : application.id === 'wine' ? 7 : 3);
    if (application.id === 'education') assert.deepEqual(labels, ['Dropout', 'Enrolled', 'Graduate']);
    for (const locale of ['zh', 'en']) {
      const copy = applicationsCopy[locale].additional[application.id];
      assert(copy.domain && copy.title && copy.body, `Missing ${locale} application copy`);
      assert.doesNotMatch(copy.body, /\d+%/u, 'Do not hardcode performance claims');
      if (locale === 'en') assert.doesNotMatch(Object.values(copy).join(' '), /\p{Script=Han}/u);
    }
  }
});
for (const id of exampleIds) {
  test(`real OpenML example ${id} preserves support/query records and original IDs`, () => {
    const source = JSON.parse(readFileSync(`content/datasets/${id}.json`, 'utf8'));
    const metadata = JSON.parse(readFileSync(`content/datasets/${id}-source.json`, 'utf8'));
    assert.equal(source.target, metadata.default_target_attribute);
    const csv = {headers: source.headers, rows: source.rows, rowLineNumbers: source.sourceRecords, fileName: `${id}.csv`, size: 0};
    const result = buildKumoDataset(csv, source.headers.indexOf(source.target));
    assert.equal(result.ok, true);
    assert.equal(result.data.request.rows.length, source.rows.length);
    assert.deepEqual(result.data.queryIndices, source.queryIndices);
    assert.equal(result.data.supportCount, source.supportIndices.length);
    assert.equal(new Set(source.sourceRecords).size, source.rows.length);
    assert(source.sourceRecords.every((n, i) => Number.isInteger(n) && n > 0 && n <= source.originalRowCount && (!i || n > source.sourceRecords[i - 1])));
    assert.deepEqual([...source.supportIndices, ...source.queryIndices].sort((a, b) => a - b), source.rows.map((_, i) => i));
    assert.deepEqual([source.rows.length, source.supportIndices.length, source.queryIndices.length], originalSplits[id], 'Do not resample the approved examples');
    for (const i of source.queryIndices) assert.equal(result.data.request.rows[i][source.target], null);
    for (const i of source.supportIndices) assert.notEqual(result.data.request.rows[i][source.target], null);
    if (id === '46979') assert.deepEqual([...new Set(source.supportIndices.map(i => result.data.request.rows[i][source.target]))].sort(), ['false', 'true']);
  });
  test(`example ${id} has complete version-bound truth and sends no evaluation labels, including reruns`, async t => {
    const source = JSON.parse(readFileSync(`content/datasets/${id}.json`, 'utf8'));
    const specs = JSON.parse(readFileSync('content/datasets/evaluation.json', 'utf8'));
    const spec = specs[id];
    assert(spec, `Missing evaluation metadata for ${id}`);
    assert.equal(spec.datasetId, id);
    assert.equal(spec.datasetVersion, versionOf(source));
    assert.equal(spec.targetColumn, source.target);
    assert.deepEqual(spec.queryLabels.map(row => row.index).sort((a, b) => a - b), source.queryIndices);
    const labelIndex = source.headers.indexOf(source.target);
    const classes = [...new Set(source.supportIndices.map(index => source.rows[index][labelIndex]))];
    for (const row of spec.queryLabels) {
      assert.equal(row.sourceRecord, source.sourceRecords[row.index]);
      assert(classes.includes(row.label));
    }
    // Changes to identity, projection, values or split must invalidate saved metadata.
    for (const mutate of [
      value => {value.sourceSha256 += 'changed';},
      value => {value.headers[0] += 'changed';},
      value => {value.target += 'changed';},
      value => {value.rows[0][0] += '0';},
      value => {value.sourceRecords[0] += 1;},
      value => {value.supportIndices.reverse();},
      value => {value.queryIndices.reverse();},
    ]) {
      const changed = structuredClone(source);
      mutate(changed);
      assert.notEqual(versionOf(changed), spec.datasetVersion);
    }
    const csv = {headers: source.headers, rows: source.rows, rowLineNumbers: source.sourceRecords, fileName: `${id}.csv`, size: 0};
    const csvBefore = structuredClone(csv);
    const actualSnapshot = await snapshotExampleEvaluation({id, data: source}, csv, labelIndex, source.queryIndices);
    assert.equal(actualSnapshot.datasetVersion, spec.datasetVersion, 'Browser WebCrypto encoding must match the offline Python hash');
    assert.deepEqual(actualSnapshot.queryIndices, source.queryIndices);
    assert.deepEqual(actualSnapshot.sourceRecords, source.sourceRecords);
    for (const mutate of [
      value => {value.rows[0][0] += '0';},
      value => {value.headers[0] += '_different_projection';},
      value => {value.headers[labelIndex] += '_different_target';},
      value => {value.rowLineNumbers[0] += 1;},
    ]) {
      const changedCsv = structuredClone(csv);
      mutate(changedCsv);
      const changedSnapshot = await snapshotExampleEvaluation({id, data: source}, changedCsv, labelIndex, source.queryIndices);
      assert.notEqual(changedSnapshot.datasetVersion, spec.datasetVersion);
    }
    const changedSplit = await snapshotExampleEvaluation({id, data: source}, csv, labelIndex, source.queryIndices.slice(1));
    assert.notEqual(changedSplit.datasetVersion, spec.datasetVersion);
    const changedTarget = await snapshotExampleEvaluation({id, data: source}, csv, 0, source.queryIndices);
    assert.notEqual(changedTarget.datasetVersion, spec.datasetVersion);
    const dataset = buildKumoDataset(csv, labelIndex).data;
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, '/api/kumo/predict');
      assert.equal(options.method, 'POST');
      const request = JSON.parse(options.body);
      requests.push(request);
      assert.deepEqual(Object.keys(request).sort(), ['rows', 'target_column']);
      assert.equal(request.target_column, source.target);
      assert.equal(request.rows.length, source.rows.length);
      for (const [index, row] of request.rows.entries()) {
        assert.deepEqual(Object.keys(row).sort(), [...source.headers].sort());
        for (const [column, header] of source.headers.entries()) {
          const expected = column === labelIndex ? (source.queryIndices.includes(index) ? null : source.rows[index][column]) : Number(source.rows[index][column]);
          // JSON represents -0 as 0; compare the actual wire numeric value.
          assert.equal(row[header], Object.is(expected, -0) ? 0 : expected, `Request changed example ${id}, row ${index}, column ${header}`);
        }
      }
      // Deterministic test response only. It is never used by the production client.
      const reverse = [...spec.queryLabels].reverse();
      return new Response(JSON.stringify({model: kumoModel, classes, row_indices: reverse.map(row => row.index), predictions: reverse.map(row => row.label), probabilities: reverse.map(row => Object.fromEntries(classes.map(label => [label, label === row.label ? 1 : 0])))}));
    });
    for (let run = 0; run < 2; run++) {
      const result = await predictWithKumo(dataset, new AbortController().signal);
      const evaluation = evaluateClassification(actualSnapshot, spec, result.predictions);
      assert.equal(evaluation.status, 'success');
      assert.equal(evaluation.accuracy, 1, 'Controlled fixture labels should match; this is not a real model score');
      assert.equal(evaluation.totalCount, originalSplits[id][2]);
      assert.deepEqual(csv, csvBefore, 'Evaluation or result mapping mutated request input');
    }
    assert.deepEqual(requests[0], requests[1], 'Prediction display or truth contaminated a repeated request');
  });
}

test('evaluation metadata contains exactly the registered 21 source datasets', () => {
  const specs = JSON.parse(readFileSync('content/datasets/evaluation.json', 'utf8'));
  assert.deepEqual(Object.keys(specs).sort(), [...exampleIds].sort());
});

test('CSV rejects characters after closing quotes without corrupting numeric input', () => {
  for (const cell of ['"1"2', '""x', '"1" "2"']) {
    assert.throws(() => parseCsv(`x,target\n${cell},A`), {code: 'parse'});
  }
});
test('CSV preserves quoted escapes, BOM, CRLF and original multiline row numbers', () => {
  const csv = parseCsv('\ufeffx,target\r\n"1" ,"a""b\r\nc"\r\n2,');
  assert.deepEqual(csv.rows, [['1', 'a"b\r\nc'], ['2', '']]);
  assert.deepEqual(csv.rowLineNumbers, [2, 4]);
});
test('existing sample and custom target preserve the request contract', () => {
  const csv = parseCsv(sampleCsv.replace('label', 'outcome'));
  const result = buildKumoDataset(csv, csv.headers.indexOf('outcome'));
  assert.equal(result.ok, true);
  assert.equal(result.data.request.target_column, 'outcome');
  assert.equal(result.data.supportCount, 18);
  assert.equal(result.data.queryIndices.length, 6);
});
test('response probabilities reject invalid totals and retain valid original row mapping', async t => {
  const csv = parseCsv(sampleCsv);
  const dataset = buildKumoDataset(csv, csv.headers.indexOf('label')).data;
  for (const [scores, valid] of [[{drift: .6, recovery: .6, steady: .6}, false], [{drift: .1, recovery: .1, steady: .8}, true]]) {
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
      model: kumoModel, classes: Object.keys(scores), row_indices: dataset.queryIndices,
      predictions: dataset.queryIndices.map(() => 'steady'), probabilities: dataset.queryIndices.map(() => scores),
    })));
    if (valid) {
      const result = await predictWithKumo(dataset, new AbortController().signal);
      assert.equal(result.predictions[0].sourceLine, 20);
      assert.equal(result.predictions[0].probability, .8);
    } else await assert.rejects(predictWithKumo(dataset, new AbortController().signal), {code: 'invalid-response'});
    t.mock.restoreAll();
  }
});
