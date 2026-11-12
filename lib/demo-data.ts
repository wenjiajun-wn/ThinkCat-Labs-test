/**
 * Synthetic browser-only demo data. Values are generated to make clusters,
 * a drift class and a few review rows legible. They are not model output.
 */
export const playgroundTargetColumn = 'label';

export const sampleCsv = `sensor_a,sensor_b,load_gap,${playgroundTargetColumn}
12.4,3.1,0.82,steady
13.1,3.4,0.79,steady
11.8,2.9,0.91,steady
12.9,3.2,0.84,steady
14.2,4.1,0.68,steady
15.1,4.6,0.62,drift
15.8,4.9,0.58,drift
16.4,5.2,0.54,drift
14.9,4.4,0.66,drift
17.2,5.6,0.49,drift
9.8,3.8,1.12,recovery
10.2,4.1,1.08,recovery
9.4,3.6,1.16,recovery
10.8,4.4,1.02,recovery
18.1,6.2,0.41,drift
11.2,3.0,0.95,steady
13.7,3.7,0.73,steady
9.9,3.9,1.10,recovery
13.3,3.3,0.81,
14.1,4.2,0.69,
15.4,4.8,0.57,
10.1,4.0,1.09,
16.1,5.1,0.52,
9.6,3.7,1.14,`;

export const sampleFile = {
  name: 'thinkcat-sensor-demo.csv',
  description: '24 rows / 3 numeric features / 1 label column',
} as const;
