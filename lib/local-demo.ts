export const sample = 'x,y,label\n1,2,A\n2,3,A\n8,7,B\n9,8,B\n3,3,\n8,9,';

export function analyzeCsv(source: string) {
  // Restricted numeric CSV, with a final label column. Empty labels are prediction rows.
  const [header = '', ...lines] = source.trim().split(/\r?\n/).filter(line => line.trim());
  const columns = header.split(',').map(value => value.trim());
  if (source.length > 65536 || lines.length > 200 || columns.length < 2 || columns.length > 13 ||
      columns.some(value => !value || /["\r\n]/.test(value)) || new Set(columns).size !== columns.length ||
      columns.at(-1) !== 'label') throw new Error('format');
  const rows = lines.map(line => {
    const cells = line.split(',').map(value => value.trim());
    const features = cells.slice(0,-1);
    if (cells.length !== columns.length || features.some(value => !value || !Number.isFinite(Number(value)))) throw new Error('format');
    return {cells, features:features.map(Number), label:cells.at(-1) ?? ''};
  });
  const support = rows.filter(row => row.label);
  const queries = rows.filter(row => !row.label);
  if (!support.length || !queries.length) throw new Error('format');
  return {columns, rows, support, queries};
}

export function classify(data: ReturnType<typeof analyzeCsv>) {
  return data.queries.map(query => {
    let nearest = data.support[0];
    let distance = Infinity;
    for (const row of data.support) {
      const candidate = Math.hypot(...row.features.map((value,index) => value - query.features[index]));
      if (candidate < distance) { nearest = row; distance = candidate; }
    }
    return [...query.cells.slice(0,-1), nearest.label];
  });
}
