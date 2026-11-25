import type {Locale} from '../../config/i18n';
import {publishedModels} from '../../config/models';
import {modelTableCopy} from '../../content/products';
import styles from './products-page.module.css';

export function ProductsPage({locale}: {locale: Locale}) {
  const t = modelTableCopy[locale];
  const number = new Intl.NumberFormat(locale);
  return <main id="main" className={styles.catalog}>
    <h1 id="models-heading">{t.title}</h1>
    <div className={styles.scroll} tabIndex={0} role="region" aria-labelledby="models-heading">
      <table aria-labelledby="models-heading">
        <thead><tr>{t.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{publishedModels.length ? publishedModels.map(model =>
          <tr key={model.id}>
            <th scope="row">{model.name}</th>
            <td>{model.tasks[locale].join(' / ')}</td>
            <td>{model.context ? number.format(model.context.samples) + ' ' + model.context.unit[locale] : '—'}</td>
            <td>{model.rowsPerSecond == null ? '—' : number.format(model.rowsPerSecond) + ' rows/s'}</td>
            <td>{model.price?.[locale] ?? '—'}</td>
          </tr>
        ) : <tr><td colSpan={t.columns.length} className={styles.empty}>
          <strong>{t.empty}</strong>
        </td></tr>}</tbody>
      </table>
    </div>
  </main>;
}
