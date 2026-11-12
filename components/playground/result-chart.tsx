import type {KumoResult} from '../../lib/kumo-api';

type Props = {
  result: KumoResult;
  label: string;
  classLabel: string;
  countLabel: string;
};

export function ResultChart({result, label, classLabel, countLabel}: Props) {
  const count = result.predictions.length;
  const max = Math.max(...result.distribution.map(item => item.count), 1);
  return <figure className="result-chart" aria-label={label}>
    <figcaption><span>{classLabel}</span><span>{count} {countLabel}</span></figcaption>
    <div className="distribution-list">
      {result.distribution.map(item => <div key={item.label} className="distribution-row">
        <span className="distribution-name">{item.label}</span>
        <span className="distribution-track" aria-hidden="true"><i style={{transform: `scaleX(${item.count / max})`}} /></span>
        <span className="distribution-value">{item.count} / {count}</span>
      </div>)}
    </div>
  </figure>;
}
