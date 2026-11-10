import type {DemoResult} from '../../lib/demo-model';

type Props = {
  result: DemoResult;
  label: string;
  classLabel: string;
  confidenceLabel: string;
  chartLabel: string;
};

export function ResultChart({result, label, classLabel, confidenceLabel, chartLabel}: Props) {
  const max = Math.max(...result.distribution.map(item => item.count), 1);
  const count = result.predictions.length;
  return <figure className="result-chart" aria-label={label}>
    <figcaption>{label}</figcaption>
    <div className="distribution-list">
      <span className="mono-label">{classLabel}</span>
      {result.distribution.map(item => <div key={item.label} className="distribution-row">
        <span className="distribution-name">{item.label}</span>
        <span className="distribution-track"><i style={{transform: `scaleX(${item.count / max})`}} /></span>
        <span className="distribution-value">{item.count}</span>
      </div>)}
    </div>
    <div className="confidence-chart">
      <span className="mono-label">{confidenceLabel}</span>
      <div className="confidence-plot">
        <div className="confidence-scale" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>
        <svg viewBox="0 0 600 120" preserveAspectRatio="none" role="img" aria-label={`${chartLabel}. ${confidenceLabel}, 0–100%.`}>
          {[8, 60, 112].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} className="confidence-guide" />)}
          {result.predictions.map((prediction, index) => {
            const x = (index + .5) * 600 / count;
            const y = 112 - prediction.confidence * 104;
            return <g key={prediction.index}>
              <line x1={x} x2={x} y1="112" y2={y} className="confidence-stem" />
              <line x1={x - 2} x2={x + 2} y1={y} y2={y} className="confidence-mark" />
            </g>;
          })}
        </svg>
      </div>
    </div>
  </figure>;
}
