export const modelIds = ['tabular', 'time-series', 'unified'] as const;
export type ModelId = typeof modelIds[number];

export type Model = {
  id: ModelId;
  index: string;
  visual: 'table' | 'time' | 'unified';
  status: 'research' | 'preview' | 'available';
  version: string | null;
  github: string | null;
  huggingFace: string | null;
};

/**
 * Publication state lives here. Bilingual descriptions live in content/products.ts.
 * Leave version and platform URLs null until the information is verified.
 */
export const models: readonly Model[] = [
  {id: 'tabular', index: '01', visual: 'table', status: 'research', version: null, github: null, huggingFace: null},
  {id: 'time-series', index: '02', visual: 'time', status: 'research', version: null, github: null, huggingFace: null},
  {id: 'unified', index: '03', visual: 'unified', status: 'research', version: null, github: null, huggingFace: null},
];
