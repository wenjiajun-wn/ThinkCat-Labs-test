'use client';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';
import {PredictionResults} from './prediction-results';
import {PredictionStatus} from './prediction-status';

type Props = {
  locale: Locale;
  state: PlaygroundRunState;
  model: string;
  headers: string[];
  labelIndex: number;
  onDownload: () => void;
  onRetry: () => void;
  onBackToData: () => void;
};

export function ResultPanel({locale, state, model, headers, labelIndex, onDownload, onRetry, onBackToData}: Props) {
  const t = playgroundCopy[locale];
  const status = {
    idle: t.states.idleLabel,
    running: t.states.runningLabel,
    error: t.states.errorLabel,
    success: t.states.successLabel,
  }[state.status];

  return <section className={`workbench-panel result-panel state-${state.status}`} aria-labelledby="result-heading" aria-busy={state.status === 'running'}>
    <header className="result-header">
      <div className="result-heading-main">
        <div className="result-title-line">
          <h2 id="result-heading" tabIndex={-1}>{t.results.title}</h2>
          <span className="result-state">{status}</span>
        </div>
        <p className="result-model">{model}</p>
      </div>
      {state.status !== 'error' && <button id="result-back" className="button button-outline result-back" type="button" onClick={onBackToData}>{t.results.backToData}</button>}
    </header>
    {state.status === 'success'
      ? <PredictionResults locale={locale} result={state.result} headers={headers} labelIndex={labelIndex} onDownload={onDownload} />
      : <PredictionStatus locale={locale} state={state} onRetry={onRetry} onBackToData={onBackToData} />}
  </section>;
}
