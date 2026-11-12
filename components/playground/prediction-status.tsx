import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';

type Props = {
  locale: Locale;
  state: Exclude<PlaygroundRunState, {status: 'success'}>;
  onRetry: () => void;
  onBackToData: () => void;
};

export function PredictionStatus({locale, state, onRetry, onBackToData}: Props) {
  const t = playgroundCopy[locale];

  if (state.status === 'idle') {
    return <div className="result-empty">
      <h3>{t.states.emptyTitle}</h3>
      <p>{t.states.emptyBody}</p>
    </div>;
  }

  if (state.status === 'running') {
    return <div className="result-loading">
      <div className="loading-head">
        <progress className="result-progress" aria-label={t.states.loadingTitle} />
        <div>
          <h3>{t.states.loadingTitle}</h3>
          <p>{t.states.loadingBody}</p>
        </div>
      </div>
      <div className="result-skeleton" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </div>;
  }

  return <div className="result-error" role="alert">
    <svg className="result-error-icon" aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8.25" /><path d="M11 6.5v5.25M11 15.25v.1" />
    </svg>
    <div className="result-error-copy">
      <h3>{t.states.errorTitle}</h3>
      <p>{state.message}</p>
      <p className="result-error-note">{t.states.errorRetention}</p>
    </div>
    <div className="result-error-actions">
      <button id="result-retry" className="button button-accent" type="button" onClick={onRetry}>{t.states.errorAction}</button>
      <button id="result-back-error" className="button button-outline" type="button" onClick={onBackToData}>{t.results.backToData}</button>
    </div>
  </div>;
}
