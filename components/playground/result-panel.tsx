'use client';
import type {DemoResult} from '../../lib/demo-model';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import {ResultChart} from './result-chart';

type State =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'error'; message: string}
  | {status: 'success'; result: DemoResult};

type Props = {
  locale: Locale;
  state: State;
  onDownload: () => void;
  onRetry: () => void;
};

export function ResultPanel({locale, state, onDownload, onRetry}: Props) {
  const t = playgroundCopy[locale];

  return <section className={`workbench-panel result-panel state-${state.status}`} aria-labelledby="result-heading" aria-busy={state.status === 'running'}>
    <div className="panel-head result-panel-head">
      <div>
        <span className="mono-label">{t.results.label}</span>
        <h2 id="result-heading" tabIndex={-1}>{t.results.title}</h2>
      </div>
      <div className="result-head-badges">
        <span className="demo-badge">{t.config.demoTag}</span>
        <span className="mono-label">{t.results.caption}</span>
      </div>
    </div>

    {state.status === 'idle' && <div className="result-empty">
      <div className="empty-diagram" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <h3>{t.states.emptyTitle}</h3>
      <p>{t.states.emptyBody}</p>
    </div>}

    {state.status === 'running' && <div className="result-loading">
      <div className="loading-head">
        <span className="loading-orbit" aria-hidden="true"><i /></span>
        <div><h3>{t.states.loadingTitle}</h3><p>{t.states.loadingBody}</p></div>
      </div>
      <div className="result-skeleton" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </div>}

    {state.status === 'error' && <div className="result-error">
      <h3>{t.states.errorTitle}</h3>
      <p>{state.message}</p>
      <button className="button button-outline" type="button" onClick={onRetry}>{t.states.errorAction}</button>
    </div>}

    {state.status === 'success' && <div className="result-success">
      <div className="result-summary">
        <div><span className="mono-label">{t.states.successTitle}</span><p>{t.states.successBody}</p></div>
        <dl>
          <div><dt>{t.results.predictionCount}</dt><dd>{state.result.predictions.length}</dd></div>
          <div><dt>{t.results.averageConfidence}</dt><dd>{Math.round(state.result.averageConfidence * 100)}%</dd></div>
          <div><dt>{t.results.supportRows}</dt><dd>{state.result.supportCount}</dd></div>
        </dl>
      </div>
      <ResultChart
        result={state.result}
        label={t.results.chartLabel}
        classLabel={t.results.classDistribution}
        confidenceLabel={t.results.confidenceLabel}
        chartLabel={t.results.chartLabel}
      />
      <div className="result-table-wrap">
        <div className="result-table-head">
          <span className="mono-label">{t.results.tableCaption}</span>
          <span className="mono-label">{t.results.k} {state.result.params.neighbors} / {state.result.params.metric === 'euclidean' ? t.results.metricLabels.euclidean : t.results.metricLabels.manhattan}</span>
        </div>
        <div className="demo-scroll" tabIndex={0} role="region" aria-label={t.results.tableCaption}>
          <table className="demo-table result-table">
            <caption>{t.results.tableCaption}</caption>
            <thead><tr>
              <th scope="col">{t.results.query}</th>
              <th scope="col">{t.results.prediction}</th>
              <th scope="col">{t.results.confidence}</th>
              <th scope="col">{t.results.distance}</th>
            </tr></thead>
            <tbody>{state.result.predictions.map(prediction => <tr key={prediction.index}>
              <th scope="row">{t.results.rowLabel} {String(prediction.index + 2).padStart(3, '0')}</th>
              <td><span className="prediction-label">{prediction.label}</span></td>
              <td><span className="agreement">{Math.round(prediction.confidence * 100)}%</span></td>
              <td>{prediction.distance.toFixed(2)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="result-actions">
        <button className="button button-accent" type="button" onClick={onDownload}>{t.results.download}<span className="button-icon" aria-hidden="true">↓</span></button>
        <p>{t.results.demoNote}</p>
      </div>
    </div>}
  </section>;
}
