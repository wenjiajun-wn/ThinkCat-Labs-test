'use client';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';

type Props = {
  locale: Locale;
  state: PlaygroundRunState;
  onRetry: () => void;
};

export function ResultPanel({locale, state, onRetry}: Props) {
  const t = playgroundCopy[locale];
  if (state.status === 'idle') return null;
  const evaluation = state.status === 'success' && state.source.kind === 'builtin' ? state.evaluation : null;
  if (state.status === 'success' && evaluation?.status !== 'unavailable') return null;
  return <section className={`workbench-panel result-panel state-${state.status}`} aria-label={t.results.title}>
    {state.status === 'running' && <p className="prediction-summary" role="status">{t.running}</p>}
    {state.status === 'error' && <div className="result-error" role="alert">
      <p>{t.requestErrors[state.code]}</p>
      <button id="result-retry" className="button button-outline" type="button" onClick={onRetry}>{t.states.errorAction}</button>
    </div>}
    {evaluation?.status === 'unavailable' && <p className="evaluation-error" role="status">{t.evaluation.unavailable}</p>}
  </section>;
}
