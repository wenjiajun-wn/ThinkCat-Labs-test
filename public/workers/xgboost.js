import {loadXGB, DMatrix, Booster} from '../vendor/xgboost-0.3.0/dist/xgboost.js';

self.onmessage = async ({data: {rows, target_column: target}}) => {
  try {
    await loadXGB();
    const started = performance.now();
    const features = Object.keys(rows[0]).filter(key => key !== target);
    const classes = [...new Set(rows.map(row => row[target]).filter(label => label !== null))].sort();
    const support = [], labels = [], query = [], indices = [];
    rows.forEach((row, index) => {
      const values = features.map(key => row[key]);
      if (row[target] === null) {
        query.push(values);
        indices.push(index);
      } else {
        support.push(values);
        labels.push(classes.indexOf(row[target]));
      }
    });
    // Each click owns a fresh worker and WASM heap, released together on completion.
    const train = new DMatrix(support);
    train.setLabel(labels);
    const booster = new Booster({objective: 'multi:softprob', num_class: classes.length,
      max_depth: 4, tree_method: 'hist', nthread: 1, seed: 0}, [train]);
    for (let round = 0; round < 50; round++) booster.update(train, round);
    const scores = booster.predict(new DMatrix(query));
    const probabilities = indices.map((_, i) => Object.fromEntries(
      classes.map((label, j) => [label, scores[i * classes.length + j]])));
    const predictions = probabilities.map(p => classes.reduce((best, c) => p[c] > p[best] ? c : best));
    self.postMessage({model: 'XGBoost', classes, row_indices: indices, probabilities, predictions,
      elapsedMs: performance.now() - started});
  } catch {
    self.postMessage({error: true});
  }
};
