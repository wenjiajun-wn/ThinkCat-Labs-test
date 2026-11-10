import type { Metadata } from 'next';
import '../legacy.css';
import { site } from '../../config/site';
import { SiteHeader, SiteFooter } from '../../components/layout/site-shell';
const title = 'Thinkcat Labs | 理解世界的每一个数值';
const description = 'Thinkcat Labs 致力于数值基础模型研究，探索表格、时间序列与统一数值表征。';
export const metadata: Metadata = {
  title, description,
  ...(site.origin ? { metadataBase: new URL(site.origin) } : {}),
  openGraph: { title, description, siteName: site.name, locale: 'zh_CN', type: 'website' },
  robots: { index: false, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body><SiteHeader />{children}<SiteFooter /></body></html>;
}


