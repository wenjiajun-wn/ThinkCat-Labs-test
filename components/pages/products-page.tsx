import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {localized, type Locale} from '../../config/i18n';
import {models, type Model} from '../../config/models';
import {copy} from '../../content/i18n';
import {productsCopy} from '../../content/products';
import {TabularMatrix, TimeSeriesStudy, UnifiedStudy} from '../visualizations/model-arts';

function ModelFacts({model, locale}:{model: Model; locale: Locale}) {
  const p = productsCopy[locale];
  const t = copy[locale];
  const study = p.studies[model.id];
  const platforms = [['GitHub', model.github], ['Hugging Face', model.huggingFace]] as const;
  return <dl className="model-facts">
    <div><dt>{p.labels.status}</dt><dd><span className="status-mark">{t.status[model.status]}</span></dd></div>
    <div><dt>{p.labels.version}</dt><dd>{model.version ?? p.labels.pending}</dd></div>
    <div><dt>{p.labels.focus}</dt><dd>{study.focus}</dd></div>
    <div><dt>{p.labels.tasks}</dt><dd><ul>{study.tasks.map(task => <li key={task}>{task}</li>)}</ul></dd></div>
    <div className="model-facts-links">
      <dt>{p.labels.links}</dt>
      {platforms.map(([label, url]) => <dd key={label}>{url
        ? <a href={url} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span></a>
        : <span className="unavailable-link">{label} <small>{p.labels.pending}</small></span>}</dd>)}
    </div>
  </dl>;
}

function ModelDetails({model, locale}:{model: Model; locale: Locale}) {
  const p = productsCopy[locale];
  const study = p.studies[model.id];
  return <details className="model-details">
    <summary><span>{p.labels.studyNotes}</span><span className="details-status mono-label">{p.labels.status} / {copy[locale].status[model.status]}</span></summary>
    <div className="model-details-body">
      {study.params && <dl className="study-params">
        {study.params.map(param => <div key={param.label}><dt>{param.label}</dt><dd>{param.value}</dd></div>)}
      </dl>}
      {study.details.map(detail => <section key={detail.title}>
        <h3>{detail.title}</h3>
        <p>{detail.body}</p>
      </section>)}
    </div>
  </details>;
}

function StudyActions({locale, dark = false}:{locale: Locale; dark?: boolean}) {
  const p = productsCopy[locale];
  return <div className={`study-actions${dark ? ' study-actions-dark' : ''}`}>
    <Link className="study-action" href={localized(locale, 'docs')}>
      <span className="mono-label">{p.labels.docs}</span>
      <strong>{p.labels.docsAction}</strong>
      <span aria-hidden="true">↗</span>
    </Link>
    <Link className="study-action" href={localized(locale, 'playground')}>
      <span className="mono-label">{p.labels.playground}</span>
      <strong>{p.labels.playgroundAction}</strong>
      <span aria-hidden="true">↗</span>
    </Link>
  </div>;
}

export function ProductsPage({locale}:{locale: Locale}) {
  const p = productsCopy[locale];
  const tabular = models[0];
  const temporal = models[1];
  const unified = models[2];

  return <main id="main" className="subpage surface-products">
    <PageHead label={p.eyebrow} title={p.title} intro={p.intro} meta={p.meta} />
    <nav className="study-index" aria-label={p.labels.modelIndex}>
      {models.map(model => <a key={model.id} href={`#${model.id}`}>
        <span className="mono-label">{model.index}</span>
        <span>{p.studies[model.id].name}</span>
        <span className="mono-label">{copy[locale].status[model.status]}</span>
      </a>)}
    </nav>

    <article className="study study-tabular" id={tabular.id}>
      <div className="study-tabular-intro">
        <p className="mono-label">{p.studies.tabular.kicker}</p>
        <h2>{p.studies.tabular.name}</h2>
        <p className="study-lede">{p.studies.tabular.summary}</p>
        <ModelFacts model={tabular} locale={locale} />
      </div>
      <figure className="study-tabular-figure">
        <TabularMatrix
          label={p.studies.tabular.figure}
          axisX={p.tabular.axisX}
          axisY={p.tabular.axisY}
          legend={p.tabular.legend}
          selectedLabel={p.tabular.selected}
          instruction={p.tabular.instruction}
          reading={p.tabular.reading}
        />
        <figcaption className="figure-caption"><span>{p.studies.tabular.figure}</span><span>{p.labels.synthetic}</span></figcaption>
      </figure>
      <div className="study-bottom">
        <div className="study-note"><span className="mono-label">{p.studies.tabular.interaction}</span><p>{p.studies.tabular.note}</p></div>
        <ModelDetails model={tabular} locale={locale} />
        <StudyActions locale={locale} />
      </div>
    </article>

    <article className="study study-time" id={temporal.id}>
      <div className="study-time-head">
        <div>
          <p className="mono-label">{p.studies['time-series'].kicker}</p>
          <h2>{p.studies['time-series'].name}</h2>
        </div>
        <p className="study-lede">{p.studies['time-series'].summary}</p>
        <div className="study-time-meta">
          <span className="status-mark status-mark-dark">{copy[locale].status[temporal.status]}</span>
          <span className="mono-label">{p.labels.version} / {p.labels.pending}</span>
        </div>
      </div>
      <figure className="study-time-figure">
        <TimeSeriesStudy
          label={p.studies['time-series'].figure}
          observedLabel={p.time.observed}
          forecastLabel={p.time.forecast}
          intervalLabel={p.time.interval}
          originLabel={p.time.origin}
          scrubLabel={p.time.scrub}
          horizonLabel={p.time.horizon}
        />
        <figcaption className="figure-caption figure-caption-dark"><span>{p.studies['time-series'].figure}</span><span>{p.labels.synthetic}</span></figcaption>
      </figure>
      <div className="study-time-foot">
        <ModelFacts model={temporal} locale={locale} />
        <ModelDetails model={temporal} locale={locale} />
      </div>
      <div className="study-time-actions"><StudyActions locale={locale} dark /></div>
    </article>

    <article className="study study-unified" id={unified.id}>
      <div className="study-unified-head">
        <div>
          <p className="mono-label">{p.studies.unified.kicker}</p>
          <h2>{p.studies.unified.name}</h2>
        </div>
        <p className="study-lede">{p.studies.unified.summary}</p>
        <ModelFacts model={unified} locale={locale} />
      </div>
      <figure className="study-unified-figure">
        <UnifiedStudy
          label={p.studies.unified.figure}
          tableLabel={p.unified.tableSide}
          seriesLabel={p.unified.seriesSide}
          sharedLabel={p.unified.linkLabel}
          instruction={p.unified.instruction}
          caption={p.studies.unified.note}
        />
        <figcaption className="figure-caption"><span>{p.studies.unified.figure}</span><span>{p.labels.synthetic}</span></figcaption>
      </figure>
      <div className="study-bottom">
        <div className="study-note"><span className="mono-label">{p.studies.unified.interaction}</span><p>{p.studies.unified.note}</p></div>
        <ModelDetails model={unified} locale={locale} />
        <StudyActions locale={locale} />
      </div>
    </article>

    <section className="product-resource-band">
      <div className="product-resource-copy">
        <span className="mono-label">{p.labels.resources}</span>
        <h2>{p.resources.title}</h2>
        <p>{p.resources.body}</p>
      </div>
      <div className="product-resource-links">
        <Link href={localized(locale, 'docs')}><span>{p.resources.docs}</span><span aria-hidden="true">↗</span></Link>
        <Link href={localized(locale, 'playground')}><span>{p.resources.playground}</span><span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  </main>;
}
