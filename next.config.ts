import type { NextConfig } from 'next';
const config: NextConfig = {
  ...(process.env.NODE_ENV === 'development' ? {
    async rewrites() {
      const port = process.env.THINKCAT_EXAMPLE_PORT;
      return [
        ...(process.env.KUMO_INFERENCE_URL || port ? [{
          source: '/api/predict/',
          destination: process.env.KUMO_INFERENCE_URL || 'http://127.0.0.1:' + port + '/donation',
        }] : []),
        {source: '/api/xgboost/predict/', destination: 'http://127.0.0.1:8765/api/xgboost/predict'}];
    },
  } : {output: 'export' as const}),
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ['127.0.0.1'],
};
export default config;
