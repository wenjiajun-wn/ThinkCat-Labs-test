import type {Locale} from '../../config/i18n';
import {BrandMark} from '../layout/brand';

const brands = [
  {name: 'Thinkcat Labs'},
  {name: 'Snowflake', path: 'M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M4 14l4 1-1 4m13-9-4-1 1-4'},
  {name: 'Databricks', path: 'm2 7 10-5 10 5-10 5zM2 12l10 5 10-5M2 17l10 5 10-5'},
  {name: 'Hugging Face', path: 'M5 13a8 8 0 1 1 14 0M8 9h.1m7.9 0h.1M9 12q3 4 6 0M4 14l4 2-2-4q1-2 3 0l3 6-4 3-5-3q-3-3 1-4zm16 0-4 2 2-4q-1-2-3 0l-3 6 4 3 5-3q3-3-1-4z'},
  {name: 'NVIDIA', path: 'M3 13c5-7 13-7 18-1-3 5-9 7-14 2 2-4 7-5 10-1-2 2-4 2-6 0M10 3h12v17H10'},
  {name: 'Stripe', path: 'M18 5H9L6 9h9l-2 5H4m14-3-3 8H6'},
  {name: 'Vercel', path: 'M12 3 23 21H1Z', solid: true},
  {name: 'Linear', path: 'M3 12a9 9 0 1 1 9 9zm0 4 5 5m-6-2 3 3'},
  {name: 'Ray / Anyscale', path: 'M12 12 4 4m8 8h9m-9 0-8 8m8-8 5-8m-5 8 5 8M2 2h4v4H2zm17 8h4v4h-4zM2 18h4v4H2z'},
] as const;

export function BrandMarquee({locale}: {locale: Locale}) {
  const zh = locale === 'zh';

  return <section className="hero-models" aria-label={zh ? '数据与 AI 生态参考' : 'Data and AI ecosystem references'}>
    <div className="model-marquee">
      <div className="model-marquee-track">
        {[0, 1, 2].map(group => <ul key={group} className="model-marquee-group" aria-hidden={group > 0 || undefined}>
          {brands.map(brand => <li key={brand.name}>
            <span>
              {'path' in brand ? <svg viewBox="0 0 24 24" fill={'solid' in brand ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={brand.path} />
              </svg> : <BrandMark />}
              {'path' in brand ? brand.name : <span className="brand-word">Thinkcat<span>Labs</span></span>}
            </span>
          </li>)}
        </ul>)}
      </div>
    </div>
  </section>;
}
