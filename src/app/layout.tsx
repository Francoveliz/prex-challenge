import type { Metadata } from 'next';
import './globals.css';
import { CurrentUserProvider } from '@/context/UserContext';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Prex challenge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={` flex flex-col gap-4 `}>
        <CurrentUserProvider>
          <Header />
          <>
            {children}
          </>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
