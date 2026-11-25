type Props = {
  title: string;
  intro: string;
  meta?: string;
  tone?: 'paper' | 'dark';
};

export function PageHead({title, intro, meta, tone = 'paper'}: Props) {
  return <header className={`page-head page-head-${tone}`}>
    <div className="page-head-main">
      <h1>{title}</h1>
      <div className="page-head-foot">
        <p>{intro}</p>
        {meta && <p className="mono-label page-head-meta">{meta}</p>}
      </div>
    </div>
  </header>;
}
