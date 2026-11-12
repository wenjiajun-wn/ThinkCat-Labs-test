export const csvLimits = {bytes: 1024 * 1024, rows: 500, columns: 31} as const;

export type ParsedCsv = {
  headers: string[];
  rows: string[][];
  rowLineNumbers: number[];
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

function parseRows(source: string) {
  const rows: string[][] = [];
  const lineNumbers: number[] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let rowStart = 1;

  function appendRow() {
    row.push(cell.trim());
    if (row.some(value => value.length > 0)) {
      rows.push(row);
      lineNumbers.push(rowStart);
    }
  }

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const lineBreak = char === '\n' || char === '\r';
    if (char === '\n' || (char === '\r' && source[i + 1] !== '\n')) line += 1;
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
    } else if (lineBreak) {
      if (char === '\r' && source[i + 1] === '\n') {
        i += 1;
        line += 1;
      }
      appendRow();
      row = [];
      cell = '';
      rowStart = line;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new CsvError('parse');
  appendRow();
  return {rows, lineNumbers};
}

export function parseCsv(source: string, fileName = 'thinkcat-demo.csv'): ParsedCsv {
  if (!source.trim()) throw new CsvError('empty');
  if (new Blob([source]).size > csvLimits.bytes) throw new CsvError('too-large');

  const {rows: parsed, lineNumbers} = parseRows(source);
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

  return {headers, rows, rowLineNumbers: lineNumbers.slice(1), fileName, size: new Blob([source]).size};
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
