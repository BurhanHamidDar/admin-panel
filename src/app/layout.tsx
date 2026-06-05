import { Inter, Oswald } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.scss';
import AuthWrapper from '@/components/AuthWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
});

export const metadata: Metadata = {
  title: 'Ayesha Ali Academy — Admin Panel',
  description: 'Admin dashboard for Ayesha Ali Academy school management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable}`}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
