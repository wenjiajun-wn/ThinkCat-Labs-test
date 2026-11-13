import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

async function load(file) {
  const {outputText} = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022},
  });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const {parseCsv} = await load('lib/csv.ts');
const {buildKumoDataset, predictWithKumo, kumoModel} = await load('lib/kumo-api.ts');
const {sampleCsv} = await load('lib/demo-data.ts');

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
