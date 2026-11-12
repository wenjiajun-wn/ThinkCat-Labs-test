import type {KumoResult} from '../../lib/kumo-api';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import {PredictionTable} from './prediction-table';
import {ResultChart} from './result-chart';

type Props = {
  locale: Locale;
  result: KumoResult;
  headers: string[];
  labelIndex: number;
  onDownload: () => void;
};

export function PredictionResults({locale, result, headers, labelIndex, onDownload}: Props) {
  const t = playgroundCopy[locale];
  const number = new Intl.NumberFormat(locale).format;

  return <div className="result-success">
    <div className="result-summary">
      <div>
        <p>{t.states.successBody}</p>
      </div>
      <dl>
        <div><dt>{t.results.predictionCount}</dt><dd>{number(result.predictions.length)}</dd></div>
        <div><dt>{t.results.supportRows}</dt><dd>{number(result.supportCount)}</dd></div>
      </dl>
    </div>
    <PredictionTable locale={locale} predictions={result.predictions} headers={headers} labelIndex={labelIndex} onDownload={onDownload} />
    <p className="result-download-note">{t.results.downloadNote}</p>
    <ResultChart result={result} label={t.results.chartLabel} classLabel={t.results.classDistribution} countLabel={t.results.predictionCount} />
  </div>;
}
