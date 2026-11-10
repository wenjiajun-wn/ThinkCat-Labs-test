import Link from 'next/link';

export function BrandMark({className = ''}:{className?: string}) {
  return <svg className={`brand-mark ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4.5 18V7.5L12 12l7.5-4.5V18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7.5 18h9" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".45" />
    <circle cx="18.9" cy="5.2" r="1.7" className="brand-mark-dot" />
  </svg>;
}

export function Brand({locale, compact = false}:{locale:'zh'|'en'; compact?: boolean}) {
  return <Link className={`brand${compact ? ' brand-compact' : ''}`} href={locale === 'zh' ? '/zh/' : '/en/'} aria-label="Thinkcat Labs">
    <BrandMark />
    <span className="brand-word">Thinkcat<span>Labs</span></span>
  </Link>;
}
