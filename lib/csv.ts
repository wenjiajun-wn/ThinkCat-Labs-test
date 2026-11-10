export const csvLimits = {bytes: 64 * 1024, rows: 200, columns: 14} as const;

export type ParsedCsv = {
  headers: string[];
  rows: string[][];
  fileName: string;
  size: number;
};

export type CsvErrorCode =
  | 'empty'
  | 'too-large'
  | 'too-many-rows'
  | 'too-many-columns'
  | 'invalid-headers'
  | 'row-width'
  | 'parse';

export class CsvError extends Error {
  code: CsvErrorCode;
  constructor(code: CsvErrorCode) {
    super(code);
    this.code = code;
  }
}

function parseRows(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      if (cell.trim()) throw new CsvError('parse');
      quoted = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(value => value.length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new CsvError('parse');
  row.push(cell.trim());
  if (row.some(value => value.length > 0)) rows.push(row);
  return rows;
}

export function parseCsv(source: string, fileName = 'thinkcat-demo.csv'): ParsedCsv {
  if (!source.trim()) throw new CsvError('empty');
  if (new Blob([source]).size > csvLimits.bytes) throw new CsvError('too-large');

  const parsed = parseRows(source);
  if (parsed.length < 2) throw new CsvError('empty');

  const headers = parsed[0];
  if (
    headers.length < 2 ||
    headers.length > csvLimits.columns ||
    headers.some(header => !header || /[\r\n]/.test(header)) ||
    new Set(headers).size !== headers.length
  ) {
    throw new CsvError(headers.length > csvLimits.columns ? 'too-many-columns' : 'invalid-headers');
  }

  const rows = parsed.slice(1);
  if (rows.length > csvLimits.rows) throw new CsvError('too-many-rows');
  if (rows.some(row => row.length !== headers.length)) throw new CsvError('row-width');

  return {headers, rows, fileName, size: new Blob([source]).size};
}

export function detectLabelColumn(headers: string[]): number {
  const preferred = headers.findIndex(header => header.toLowerCase() === 'label');
  return preferred >= 0 ? preferred : headers.length - 1;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
