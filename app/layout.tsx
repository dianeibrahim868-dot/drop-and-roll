import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata={title:'Drop & Roll — Derma Systems',description:'Boutique Drop & Roll',metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000')};
export const viewport={width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}