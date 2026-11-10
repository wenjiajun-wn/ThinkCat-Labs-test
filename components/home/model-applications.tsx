import Link from 'next/link';
import {localized, type Locale} from '../../config/i18n';
import {models} from '../../config/models';
import {applicationsCopy} from '../../content/applications';
import {productsCopy} from '../../content/products';
import {solutionsCopy} from '../../content/solutions';
import {IndustryMiniature} from '../visualizations/industry-miniatures';

export function ModelApplications({locale}: {locale: Locale}) {
  const t = applicationsCopy[locale];
  const industries = solutionsCopy[locale];

  return <section id="model-applications" className="home-applications" aria-labelledby="model-applications-title">
    <header className="applications-heading">
      <h2 id="model-applications-title">{t.title}</h2>
      <p>{t.intro}</p>
    </header>
    <div className="applications-grid">
      {models.map(model => {
        const scenario = t.scenarios[model.id];
        const modelName = productsCopy[locale].studies[model.id].name;

        return <article className="application-card" key={model.id}>
          <figure className="application-figure">
            <IndustryMiniature id={scenario.visual} locale={locale} />
            <figcaption className="mono-label">{industries.labels.synthetic}</figcaption>
          </figure>
          <div className="application-copy">
            <h3>{scenario.title}</h3>
            <p>{scenario.body}</p>
            <Link className="text-link" href={`${localized(locale, 'products')}#${model.id}`}>
              {modelName} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
