import '../globals.css';
import {copy} from '../../content/i18n';
export const metadata = {title:'Thinkcat Labs', description:copy.en.mission, robots:{index:false,follow:true}};
export default function EntryLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
