'use client';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';
import {ResultChart} from './result-chart';

type Props = {
  locale: Locale;
  state: PlaygroundRunState;
  onRetry: () => void;
};

export function ResultPanel({locale, state, onRetry}: Props) {
  const t = playgroundCopy[locale];
  if (state.status === 'idle') return null;
  const evaluation = state.status === 'success' && state.source.kind === 'builtin' ? state.evaluation : null;
  return <section className={`workbench-panel result-panel state-${state.status}`} aria-label={t.results.title}>
    {state.status === 'running' && <p className="prediction-summary" role="status">{t.running}</p>}
    {state.status === 'error' && <div className="result-error" role="alert">
      <p>{t.requestErrors[state.code]}</p>
      <button id="result-retry" className="button button-outline" type="button" onClick={onRetry}>{t.states.errorAction}</button>
    </div>}
    {evaluation?.status === 'success' && <div className="evaluation-block">
      <p className="prediction-summary evaluation-summary" role="status" data-accuracy={evaluation.accuracy} data-correct={evaluation.correctCount} data-total={evaluation.totalCount}>
        <span>{t.evaluation.accuracy}</span>
        <strong>{new Intl.NumberFormat(locale, {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1}).format(evaluation.accuracy)}</strong>
        <span className="evaluation-count">{evaluation.correctCount} / {evaluation.totalCount} {t.evaluation.correctCount}</span>
      </p>
      <p className="evaluation-note">{t.evaluation.note}</p>
    </div>}
    {evaluation?.status === 'unavailable' && <p className="evaluation-error" role="status">{t.evaluation.unavailable}</p>}
    {state.status === 'success' && <ResultChart result={state.result} label={t.results.chartLabel} classLabel={t.results.classDistribution} countLabel={t.results.predictionCount} />}
  </section>;
}
