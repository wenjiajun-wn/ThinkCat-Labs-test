'use client';
import {useState} from 'react';
import {solutionsCopy, type IndustryId} from '../../content/solutions';
import {homeCopy} from '../../content/home';
import {type Locale} from '../../config/i18n';
import {IndustryMiniature} from '../visualizations/industry-miniatures';
import {HomeStudy} from './home-study';

export function FieldIndex({locale}: {locale: Locale}) {
  const t = solutionsCopy[locale];
  const h = homeCopy[locale].applications;
  const [active, setActive] = useState<IndustryId>(t.studies[0].id);
  const study = t.studies.find(item => item.id === active) ?? t.studies[0];

  return <HomeStudy id="home-fields" className="home-fields" label={t.indexLabel} title={t.title} description={t.intro}
    panel={<>
      <div className="study-panel-meta">
        <span className="mono-label">{study.index} / {study.name}</span>
        <span className="status-mark">{t.labels.synthetic}</span>
      </div>
      <figure className="study-figure">
        <div className="study-graphic" key={study.id}>
          <IndustryMiniature id={study.id} locale={locale} />
        </div>
        <figcaption className="study-caption" aria-live="polite">
          <h3>{study.label}</h3>
          <p>{study.question}</p>
          <p>{h.previewReadings[study.id]}</p>
        </figcaption>
      </figure>
    </>}>
    <div className="study-options field-tabs" role="group" aria-label={t.indexLabel}>
      {t.studies.map(item => <button key={item.id} type="button" className="study-option"
        aria-pressed={active === item.id} aria-controls="home-fields-panel"
        onClick={() => setActive(item.id)}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(item.id); }}
        onFocus={() => setActive(item.id)}>
        <span className="study-option-index">{item.index}</span>
        <strong className="study-option-name">{item.name}</strong>
        <span className="study-option-meta">{item.label}</span>
      </button>)}
    </div>
    <p className="home-study-note">{t.disclaimer}</p>
  </HomeStudy>;
}
