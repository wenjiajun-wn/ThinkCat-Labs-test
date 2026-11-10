'use client';
import Link from 'next/link';
import {useState} from 'react';
import {models, type ModelId} from '../../config/models';
import {copy} from '../../content/i18n';
import {homeCopy} from '../../content/home';
import {productsCopy} from '../../content/products';
import {localized, type Locale} from '../../config/i18n';
import {ModelGlyph} from '../visualizations/model-arts';
import {HomeStudy} from './home-study';

export function ModelIndex({locale}: {locale: Locale}) {
  const [active, setActive] = useState<ModelId>(models[0].id);
  const h = homeCopy[locale].models;
  const p = productsCopy[locale];
  const activeModel = models.find(model => model.id === active) ?? models[0];
  const activeCopy = p.studies[activeModel.id];
  const status = copy[locale].status;

  return <HomeStudy id="home-models" className="home-models" label={h.label} title={h.title} description={h.body}
    panel={<>
      <div className="study-panel-meta">
        <span className="mono-label">{activeModel.index} / {activeCopy.name}</span>
        <span className="status-mark">{status[activeModel.status]}</span>
      </div>
      <figure className="study-figure">
        <div className="study-graphic" key={activeModel.id}>
          <ModelGlyph id={activeModel.id} />
        </div>
        <figcaption className="study-caption" aria-live="polite">
          <h3>{activeCopy.name}</h3>
          <p>{activeCopy.summary}</p>
        </figcaption>
      </figure>
      <Link className="text-link" href={`${localized(locale, 'products')}#${activeModel.id}`}>{h.link} <span aria-hidden="true">↗</span></Link>
    </>}>
    <div className="study-options model-index" role="group" aria-label={h.label}>
      {models.map(model => {
        const modelCopy = p.studies[model.id];
        return <button key={model.id} type="button" className="study-option model-index-row"
          aria-pressed={active === model.id} aria-controls="home-models-panel"
          onClick={() => setActive(model.id)}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(model.id); }}
          onFocus={() => setActive(model.id)}>
          <span className="study-option-index">{model.index}</span>
          <strong className="study-option-name">{modelCopy.name}</strong>
          <span className="study-option-meta">{modelCopy.short}</span>
        </button>;
      })}
    </div>
    <dl className="model-index-facts">
      <div><dt>{p.labels.focus}</dt><dd>{activeCopy.focus}</dd></div>
      <div><dt>{p.labels.tasks}</dt><dd>{activeCopy.tasks.join(' / ')}</dd></div>
    </dl>
    <p className="home-study-note">{h.note}</p>
  </HomeStudy>;
}
