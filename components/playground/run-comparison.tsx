import {comparisonCopy, playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';
import type {PlaygroundRunState} from './result-types';

type Props = {locale: Locale; primary: PlaygroundRunState; baseline: PlaygroundRunState};

export function RunComparison({locale, primary, baseline}: Props) {
  const t = comparisonCopy[locale];
  const copy = playgroundCopy[locale];
  let speed: string | undefined;
  if (primary.status === 'success' && baseline.status === 'success') {
    const ours = primary.result.elapsedMs;
    const theirs = baseline.result.elapsedMs;
    if (ours && theirs) {
      const ratio = Math.max(ours, theirs) / Math.min(ours, theirs);
      speed = ratio.toFixed(1) === '1.0' ? t.equalTime : locale === 'zh'
        ? `${ours < theirs ? t.faster : t.slower} ${ratio.toFixed(1)}×`
        : `${ratio.toFixed(1)}× ${ours < theirs ? t.faster : t.slower}`;
    }
  }
  return <section className="run-comparison" aria-live="polite">
    {[primary, baseline].map((state, i) => <div className="run-metric" key={i}>
      <strong>{i ? 'XGBoost' : state.status === 'success' && state.result.timing === 'recordedNeighbors' ? t.neighbors : t.model}</strong>
      {state.status === 'idle' && <small>{i ? t.pendingX : t.pending}</small>}
      {state.status === 'running' && <small>{i ? t.running : copy.running}</small>}
      {state.status === 'error' && <small>{copy.requestErrors[state.code]}</small>}
      {state.status === 'success' && <>
        <div title={t[state.result.timing ?? 'request']}>{t.time} <b>{state.result.elapsedMs === undefined ? '—' : `${Number(state.result.elapsedMs.toFixed(2))} ms`}</b></div>
        <div>{copy.evaluation.accuracy} <b>{state.evaluation?.status === 'success'
          ? `${(100 * state.evaluation.accuracy).toFixed(1)}% (${state.evaluation.correctCount}/${state.evaluation.totalCount})`
          : '—'}</b> {state.source.kind === 'upload' && <small>{t.needLabels}</small>}</div>

      </>}
    </div>)}
    {speed && primary.status === 'success' && <div className="comparison-summary">
      {primary.result.timing === 'recordedNeighbors' ? t.mockContext : t.context}
      <strong>{speed}</strong>
    </div>}
  </section>;
}
