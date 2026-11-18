import Link from 'next/link';
import Image from 'next/image';
import {localized, type Locale} from '../../config/i18n';
import {models} from '../../config/models';
import {additionalApplications, applicationDatasets, applicationsCopy} from '../../content/applications';
import {IndustryMiniature} from '../visualizations/industry-miniatures';

export function ModelApplications({locale}: {locale: Locale}) {
  const t = applicationsCopy[locale];
  const exampleHref = (datasetId: string) => `${localized(locale, 'playground')}?${new URLSearchParams({dataset: datasetId})}`;

  return <section id="model-applications" className="home-applications" aria-labelledby="model-applications-title">
    <header className="applications-heading">
      <h2 id="model-applications-title">{t.title}</h2>
    </header>
    <div className="applications-viewport" role="region" aria-label={t.browseLabel} tabIndex={0}>
    <div className="applications-grid">
      {models.map(model => {
        const scenario = t.scenarios[model.id];

        return <article className="application-card" key={model.id}>
          <figure className={`application-figure${scenario.visual === 'finance' ? ' application-figure-reference' : scenario.visual === 'industry' ? ' application-figure-reference application-figure-steel' : scenario.visual === 'energy' ? ' application-figure-reference application-figure-mine' : ''}`}>
            {scenario.visual === 'finance' ? <Image
              className="application-reference-image"
              src="/images/credit-risk-review.png"
              width={1774}
              height={887}
              alt={scenario.imageAlt}
            /> : scenario.visual === 'industry' ? <Image
              className="application-reference-image"
              src="/images/steel-category.png"
              width={1774}
              height={887}
              alt={scenario.imageAlt}
            /> : scenario.visual === 'energy' ? <Image
              className="application-reference-image"
              src="/images/mining-risk-trend.png"
              width={1672}
              height={941}
              alt={scenario.imageAlt}
            /> : <IndustryMiniature id={scenario.visual} locale={locale} />}
          </figure>
          <div className="application-copy">
            <h3>{scenario.title}</h3>
            <p className="application-description">{scenario.body}</p>
            <Link className="button button-accent" prefetch={false} href={exampleHref(applicationDatasets[model.id])}>
              {t.runExample}
            </Link>
          </div>
        </article>;
      })}
        {additionalApplications.map(application => {
          const copy = t.additional[application.id];
          const titleId = `application-extra-${application.id}`;
          return <article key={application.id} className="application-card" aria-labelledby={titleId}>
            <figure className="application-figure application-generated-figure">
              <Image src={`/images/application-${application.id}.webp`} width={1774} height={887} alt={copy.imageAlt} sizes="(max-width: 700px) 90vw, 40vw" />
            </figure>
            <div className="application-copy">
              <h3 id={titleId}>{copy.title}</h3>
              <p className="application-description">{copy.body}</p>
              <Link className="button button-accent" prefetch={false} href={exampleHref(application.datasetId)} aria-labelledby={`${titleId} ${titleId}-action`}>
                <span id={`${titleId}-action`}>{t.runExample}</span>
              </Link>
            </div>
          </article>;
        })}
    </div>
    </div>
  </section>;
}
