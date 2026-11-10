import type {ReactNode} from 'react';

type Props = {
  id: string;
  className: string;
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  panel: ReactNode;
};

export function HomeStudy({id, className, label, title, description, children, panel}: Props) {
  return <section className={`home-study ${className}`} aria-labelledby={`${id}-heading`}>
    <div className="home-study-inner">
      <div className="study-controls">
        <header className="study-heading">
          <p className="mono-label">{label}</p>
          <h2 id={`${id}-heading`}>{title}</h2>
          <p className="study-intro">{description}</p>
        </header>
        {children}
      </div>
      <div id={`${id}-panel`} className="study-panel">{panel}</div>
    </div>
  </section>;
}
