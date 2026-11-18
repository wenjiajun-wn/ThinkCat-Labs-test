import {Badge} from '../ui/primitives';
import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {ModelTabs} from './model-tabs';
import {localized, type Locale} from '../../config/i18n';
import {models, type Model} from '../../config/models';
import {copy} from '../../content/i18n';
import {productsCopy} from '../../content/products';
import {UnifiedStudy} from '../visualizations/model-arts';

function ModelFacts({model, locale, metadataOnly = false}:{model: Model; locale: Locale; metadataOnly?: boolean}) {
  const p = productsCopy[locale];
  const t = copy[locale];
  const study = p.studies[model.id];
  const platforms = [['GitHub', model.github], ['Hugging Face', model.huggingFace]] as const;
  return <dl className="model-facts">
    {!metadataOnly && <div><dt>{p.labels.status}</dt><dd><Badge className="status-mark">{t.status[model.status]}</Badge></dd></div>}
    <div><dt>{p.labels.version}</dt><dd>{model.version ?? p.labels.pending}</dd></div>
    {!metadataOnly && <div><dt>{p.labels.focus}</dt><dd>{study.focus}</dd></div>}
    {!metadataOnly && <div><dt>{p.labels.tasks}</dt><dd><ul>{study.tasks.map(task => <li key={task}>{task}</li>)}</ul></dd></div>}
    <div className="model-facts-links">
      <dt>{p.labels.links}</dt>
      {platforms.map(([label, url]) => <dd key={label}>{url
        ? <a href={url} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span></a>
        : <span className="unavailable-link">{label} <small>{p.labels.pending}</small></span>}</dd>)}
    </div>
  </dl>;
}

function ModelDetails({model, locale, defaultOpen = false}:{model: Model; locale: Locale; defaultOpen?: boolean}) {
  const p = productsCopy[locale];
  const study = p.studies[model.id];
  return <details className="model-details" open={defaultOpen}>
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

function TextModelStudy({model, locale}:{model: Model; locale: Locale}) {
  const p = productsCopy[locale];
  const study = p.studies[model.id];
  const dark = model.id === 'time-series';
  return <article className={`study study-text ${dark ? 'study-time' : 'study-tabular'}`} id={model.id}>
    <div className="study-text-head">
      <header className="study-text-identity">
        <p className="mono-label">{study.kicker}</p>
        <h2>{study.name}</h2>
        <Badge className="status-mark">{copy[locale].status[model.status]}</Badge>
      </header>
      <div className="study-text-description">
        <p className="study-lede">{study.pageSummary ?? study.summary}</p>
        <dl className="study-text-tasks">
          <dt>{p.labels.tasks}</dt>
          <dd>{study.tasks.join(' / ')}</dd>
        </dl>
      </div>
    </div>
    <div className="study-text-info">
      <ModelFacts model={model} locale={locale} metadataOnly />
      <ModelDetails model={model} locale={locale} defaultOpen={dark} />
      <StudyActions locale={locale} dark={dark} />
    </div>
  </article>;
}

export function ProductsPage({locale}:{locale: Locale}) {
  const p = productsCopy[locale];
  const tabular = models[0];
  const temporal = models[1];
  const unified = models[2];

  return <main id="main" className="subpage surface-products">
    <PageHead label={p.eyebrow} title={p.title} intro={p.intro} />
    <ModelTabs label={p.labels.modelIndex} items={[
      {...tabular, name: p.studies.tabular.name, content: <TextModelStudy model={tabular} locale={locale} />},
      {...temporal, name: p.studies['time-series'].name, content: <TextModelStudy model={temporal} locale={locale} />},
      {...unified, name: p.studies.unified.name, content:
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
      },
    ]} />

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
