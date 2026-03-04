import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Move by Trella — Move Anything, Anywhere',
  description:
    'Request a truck in minutes. Move furniture, motorcycles, boxes and more across Cairo with Trella.',
  openGraph: {
    title: 'Move by Trella',
    description: 'Request a truck in minutes. We handle the heavy lifting.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${roboto.className} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
