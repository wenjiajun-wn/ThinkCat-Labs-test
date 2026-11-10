type Props = {
  index: string;
  label: string;
  title: string;
  intro: string;
  meta: string;
  tone?: 'paper' | 'dark';
};

export function PageHead({index, label, title, intro, meta, tone = 'paper'}: Props) {
  return <header className={`page-head page-head-${tone}`}>
    <div className="page-head-rail">
      <span className="mono-label">{index}</span>
      <span className="rail-line" aria-hidden="true" />
      <span className="mono-label">{label}</span>
    </div>
    <div className="page-head-main">
      <h1>{title}</h1>
      <div className="page-head-foot">
        <p>{intro}</p>
        <p className="mono-label page-head-meta">{meta}</p>
      </div>
    </div>
  </header>;
}
