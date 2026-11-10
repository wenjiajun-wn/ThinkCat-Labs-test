import type {ParsedCsv} from './csv';

export type DemoRow = {
  index: number;
  cells: string[];
  features: number[];
  label: string;
};

export type DemoDataset = {
  headers: string[];
  labelIndex: number;
  featureIndexes: number[];
  support: DemoRow[];
  queries: DemoRow[];
};

export type DatasetError =
  | 'no-features'
  | 'non-numeric'
  | 'no-support'
  | 'no-queries';

export type DatasetResult =
  | {ok: true; data: DemoDataset}
  | {ok: false; code: DatasetError};

export type Metric = 'euclidean' | 'manhattan';

export type DemoParams = {
  neighbors: number;
  metric: Metric;
  normalize: boolean;
};

export type Prediction = {
  index: number;
  cells: string[];
  label: string;
  confidence: number;
  distance: number;
  neighbors: readonly {label: string; distance: number}[];
};

export type DemoResult = {
  predictions: Prediction[];
  classes: string[];
  distribution: readonly {label: string; count: number}[];
  averageConfidence: number;
  params: DemoParams;
  supportCount: number;
};

export function buildDataset(csv: ParsedCsv, labelIndex: number): DatasetResult {
  const featureIndexes = csv.headers.map((_, index) => index).filter(index => index !== labelIndex);
  if (!featureIndexes.length) return {ok: false, code: 'no-features'};

  const rows: DemoRow[] = [];
  for (let index = 0; index < csv.rows.length; index += 1) {
    const cells = csv.rows[index];
    const features: number[] = [];
    for (const featureIndex of featureIndexes) {
      const value = Number(cells[featureIndex]);
      if (cells[featureIndex] === '' || !Number.isFinite(value)) return {ok: false, code: 'non-numeric'};
      features.push(value);
    }
    rows.push({index, cells, features, label: cells[labelIndex].trim()});
  }

  const support = rows.filter(row => row.label.length > 0);
  const queries = rows.filter(row => row.label.length === 0);
  if (!support.length) return {ok: false, code: 'no-support'};
  if (!queries.length) return {ok: false, code: 'no-queries'};

  return {ok: true, data: {headers: csv.headers, labelIndex, featureIndexes, support, queries}};
}

function distance(a: number[], b: number[], metric: Metric): number {
  if (metric === 'manhattan') return a.reduce((total, value, index) => total + Math.abs(value - b[index]), 0);
  return Math.hypot(...a.map((value, index) => value - b[index]));
}

function normalise(rows: DemoRow[], featureCount: number) {
  const means = Array.from({length: featureCount}, (_, index) => rows.reduce((sum, row) => sum + row.features[index], 0) / rows.length);
  const spreads = Array.from({length: featureCount}, (_, index) => {
    const variance = rows.reduce((sum, row) => sum + (row.features[index] - means[index]) ** 2, 0) / rows.length;
    return Math.sqrt(variance) || 1;
  });
  return (features: number[]) => features.map((value, index) => (value - means[index]) / spreads[index]);
}

export function runLocalDemo(data: DemoDataset, params: DemoParams): DemoResult {
  const transform = params.normalize ? normalise([...data.support, ...data.queries], data.featureIndexes.length) : (value: number[]) => value;
  const support = data.support.map(row => ({...row, features: transform(row.features)}));
  const queries = data.queries.map(row => ({...row, features: transform(row.features)}));
  const k = Math.max(1, Math.min(params.neighbors, support.length));

  const predictions = queries.map<Prediction>(query => {
    const ranked = support
      .map(row => ({label: row.label, distance: distance(query.features, row.features, params.metric)}))
      .sort((a, b) => a.distance - b.distance);
    const neighbors = ranked.slice(0, k);
    const counts = new Map<string, number>();
    for (const neighbor of neighbors) counts.set(neighbor.label, (counts.get(neighbor.label) ?? 0) + 1);
    const label = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || neighbors.findIndex(n => n.label === a[0]) - neighbors.findIndex(n => n.label === b[0]))[0][0];
    return {
      index: query.index,
      cells: query.cells,
      label,
      confidence: (counts.get(label) ?? 0) / neighbors.length,
      distance: neighbors.reduce((sum, neighbor) => sum + neighbor.distance, 0) / neighbors.length,
      neighbors,
    };
  });

  const classMap = new Map<string, number>();
  for (const prediction of predictions) classMap.set(prediction.label, (classMap.get(prediction.label) ?? 0) + 1);
  const classes = [...new Set(support.map(row => row.label))].sort((a, b) => a.localeCompare(b));
  const distribution = [...classMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({label, count}));

  return {
    predictions,
    classes,
    distribution,
    averageConfidence: predictions.reduce((sum, row) => sum + row.confidence, 0) / predictions.length,
    params: {...params, neighbors: k},
    supportCount: support.length,
  };
}
