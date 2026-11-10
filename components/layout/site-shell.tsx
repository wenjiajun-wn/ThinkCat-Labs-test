'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '../../config/site';
import { MobileNav } from '../visuals';

const links = [
  { href: '/technology/', en: 'Technology', zh: '技术' },
  { href: '/research/', en: 'Research', zh: '研究' },
  { href: '/about/', en: 'About', zh: '关于' },
  { href: '/contact/', en: 'Contact', zh: '联系' },
];

export function SiteHeader() {
  const pathname = usePathname();
  return <>
    <Link className="skip" href="#main">跳至正文</Link>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Thinkcat Labs 首页">thinkcat<span>labs</span><i aria-hidden="true">⌁</i></Link>
      <nav className="desktop-nav" aria-label="主导航">
        {links.map(link => <Link key={link.en} href={link.href} aria-current={pathname.replace(/\/$/, '') === link.href.slice(0,-1) ? 'page' : undefined}>{link.zh}</Link>)}
      </nav>
      <MobileNav />
    </header>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <Link className="brand" href="/">thinkcat<span>labs</span></Link>
    <p>构建面向全球结构化数据的基础模型。</p>
    <nav aria-label="页脚导航">{links.map(link => <Link key={link.en} href={link.href}>{link.zh}</Link>)}</nav>
    <div className="footer-legal"><span>© {new Date().getFullYear()} Thinkcat Labs</span><Link href="/privacy/">隐私说明 ↗</Link>{site.legalName && <span>{site.legalName}</span>}{site.icp && <a href="https://beian.miit.gov.cn/">{site.icp}</a>}{site.policeRecord && <span>{site.policeRecord}</span>}</div>
  </footer>;
}
