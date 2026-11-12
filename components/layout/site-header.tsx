'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {Brand} from './brand';
import {LanguageSwitch} from './language-switch';
import type {Locale} from '../../config/i18n';

type NavItem = {href: string; label: string; key: string};

type Props = {
  locale: Locale;
  nav: readonly NavItem[];
  menuLabel: string;
  closeLabel: string;
  languageLabel: string;
  skipLabel: string;
};

export function SiteHeader({locale, nav, menuLabel, closeLabel, languageLabel, skipLabel}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  function closeMenu() {
    restoreFocus.current = true;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const menuButton = toggle.current;
    const previous = document.body.style.overflow;
    const main = document.querySelector('main');
    const footer = document.querySelector('.site-footer');
    document.body.style.overflow = 'hidden';
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');
    firstLink.current?.focus();
    const panel = document.getElementById('mobile-navigation');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreFocus.current = true;
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(element => !element.hasAttribute('hidden'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    const onResize = () => {
      if (window.innerWidth > 1000) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previous;
      main?.removeAttribute('inert');
      footer?.removeAttribute('inert');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      if (restoreFocus.current) {
        restoreFocus.current = false;
        menuButton?.focus();
      }
    };
  }, [open]);

  const isActive = (href: string) => pathname.replace(/\/$/, '') === href.replace(/\/$/, '');

  return <>
    <a className="skip" href="#main">{skipLabel}</a>
    <header className={`site-header${open ? ' menu-open' : ''}`}>
      <div className="site-header-inner" inert={open}>
        <Brand locale={locale} />
        <nav className="primary-nav" aria-label={menuLabel}>
          {nav.map((item, index) => <Link
            key={item.key}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={index === nav.length - 1 ? 'nav-last' : undefined}
          >{item.label}</Link>)}
        </nav>
        <div className="header-tools">
          <LanguageSwitch locale={locale} label={languageLabel} />
          <button
            ref={toggle}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? closeLabel : menuLabel}
            onClick={() => setOpen(value => !value)}
          >
            <span className="menu-label">{open ? closeLabel : menuLabel}</span>
            <span className="menu-lines" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <div id="mobile-navigation" className="mobile-navigation" role="dialog" aria-modal="true" aria-label={menuLabel} hidden={!open}>
        <div className="mobile-navigation-top">
          <span className="mono-label">Thinkcat Labs / 2026</span>
          <button className="mobile-menu-close" type="button" onClick={closeMenu}>
            {closeLabel}<span aria-hidden="true">×</span>
          </button>
        </div>
        <nav aria-label={menuLabel}>
          {nav.map((item, index) => <Link
            key={item.key}
            ref={index === 0 ? firstLink : undefined}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            <span className="mobile-index">0{index + 1}</span>
            <span>{item.label}</span>
            <span className="mobile-arrow" aria-hidden="true">↗</span>
          </Link>)}
        </nav>
        <div className="mobile-navigation-foot">
          <span className="mono-label">{locale === 'zh' ? '结构化数据 / 数值智能' : 'Structured data / numerical intelligence'}</span>
          <LanguageSwitch locale={locale} label={languageLabel} />
        </div>
      </div>
    </header>
  </>;
}
