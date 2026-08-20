import './globals.css';
import type { Metadata } from 'next';
import { StoreProvider } from '@/lib/store';
import { LocationProvider } from '@/lib/location-store';
import { ToastProvider } from '@/lib/toast';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginDialog from '@/components/auth/LoginDialog';

export const metadata: Metadata = {
  metadataBase: new URL('https://bikanerbakery.example'),
  title: 'Bikaner Bakery — Fresh Cakes, Breads & Treats Delivered',
  description: 'Order freshly baked cakes, breads, cookies, and snacks from Bikaner Bakery. Fast delivery, premium ingredients, baked with love daily.',
  openGraph: {
    title: 'Bikaner Bakery — Fresh Cakes, Breads & Treats Delivered',
    description: 'Order freshly baked cakes, breads, cookies, and snacks from Bikaner Bakery.',
    images: [{ url: '/WhatsApp_Image_2026-08-20_at_11.40.38_AM.jpeg' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: '/WhatsApp_Image_2026-08-20_at_11.40.38_AM.jpeg' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            <LocationProvider>
              <ToastProvider>
              <Header />
              {children}
              <Footer />
              <LoginDialog />
              </ToastProvider>
            </LocationProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
