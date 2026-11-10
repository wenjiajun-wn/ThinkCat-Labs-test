import '../globals.css';
export const metadata = {title:'Thinkcat Labs', robots:{index:false,follow:true}};
export default function EntryLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
