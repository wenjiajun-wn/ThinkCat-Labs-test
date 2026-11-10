import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['out/**', '.next/**', '.npm-cache/**', 'artifacts/**', 'screenshots/**', '.browser-profile/**', 'node_modules/**', 'next-env.d.ts']),
]);
