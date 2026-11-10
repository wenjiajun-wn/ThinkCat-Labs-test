'use client';
import type {ParsedCsv} from '../../lib/csv';
import type {DemoParams, Metric} from '../../lib/demo-model';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';

type Props = {
  locale: Locale;
  csv: ParsedCsv | null;
  labelIndex: number;
  datasetError: string | null;
  params: DemoParams;
  running: boolean;
  hasResult: boolean;
  onLabelChange: (index: number) => void;
  onParams: (params: DemoParams) => void;
  onRun: () => void;
};

export function ConfigPanel({locale, csv, labelIndex, datasetError, params, running, hasResult, onLabelChange, onParams, onRun}: Props) {
  const t = playgroundCopy[locale];
  const models = t.model.options;

  return <section className="workbench-panel config-panel" aria-labelledby="config-heading">
    <div className="panel-head">
      <span className="mono-label">{t.config.label}</span>
      <h2 id="config-heading" tabIndex={-1}>{t.config.title}</h2>
    </div>
    <div className="field-group">
      <label htmlFor="model-select" className="field-label">{t.model.label}</label>
      <select id="model-select" className="select-control" defaultValue="tabular" disabled={running} aria-describedby="demo-model-help">
        {models.map(option => <option key={option.id} value={option.id} disabled={option.disabled}>{option.label} · {option.state}</option>)}
      </select>
      <p className="field-help" id="demo-model-help">{t.model.note}</p>
    </div>
    <div className="field-group">
      <label htmlFor="label-select" className="field-label">{t.config.labelColumn}</label>
      <select
        id="label-select"
        className="select-control"
        value={labelIndex}
        disabled={!csv || running}
        aria-describedby={datasetError ? 'demo-label-help demo-dataset-error' : 'demo-label-help'}
        onChange={event => onLabelChange(Number(event.target.value))}
      >
        {csv?.headers.map((header, index) => <option key={header} value={index}>{header}</option>)}
      </select>
      <p className="field-help" id="demo-label-help">{t.config.labelHelp}</p>
    </div>
    <details className="advanced-params">
      <summary>
        <span>{t.config.advanced}</span>
        <span className="field-help">k={params.neighbors} · {t.results.metricLabels[params.metric]}</span>
      </summary>
      <fieldset className="advanced-fields" disabled={running || !csv}>
        <div className="param-block">
          <div className="param-row">
            <label htmlFor="neighbors" className="field-label">{t.config.neighbor}</label>
            <output htmlFor="neighbors" className="param-output">{params.neighbors}</output>
          </div>
          <input
            id="neighbors"
            className="range-control"
            type="range"
            min="1"
            max="9"
            step="1"
            value={params.neighbors}
            onChange={event => onParams({...params, neighbors: Number(event.target.value)})}
          />
          <p className="field-help">{t.config.neighborHelp}</p>
        </div>
        <fieldset className="field-group param-fieldset">
          <legend className="field-label">{t.config.metric}</legend>
          <div className="segmented">
            {(['euclidean', 'manhattan'] as Metric[]).map(metric => <label key={metric} className="segment">
              <input type="radio" name="metric" value={metric} checked={params.metric === metric} onChange={() => onParams({...params, metric})} />
              <span>{metric === 'euclidean' ? t.config.euclidean : t.config.manhattan}</span>
            </label>)}
          </div>
        </fieldset>
        <label className="check-row">
          <input type="checkbox" checked={params.normalize} onChange={event => onParams({...params, normalize: event.target.checked})} />
          <span><strong>{t.config.normalize}</strong><small>{t.config.normalizeHelp}</small></span>
        </label>
      </fieldset>
    </details>
    {datasetError && <p className="inline-error" id="demo-dataset-error" role="alert">{datasetError}</p>}
    {!csv && <p className="field-help">{t.config.blocked}</p>}
    <button className={`button button-accent run-button${running ? ' is-running' : ''}`} type="button" onClick={onRun} disabled={running || !csv || Boolean(datasetError)}>
      <span>{running ? t.config.running : hasResult ? t.config.rerun : t.config.run}</span>
      <span className="button-icon" aria-hidden="true">{running ? '···' : '↗'}</span>
    </button>
  </section>;
}
