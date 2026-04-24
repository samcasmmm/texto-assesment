import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/provider/AuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TextoHRMS - Admin Dashboard',
  description: 'Modern HRMS for employee tracking and management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.className} ${geistMono.variable} h-full antialiased`}
    >
      <body className=' bg-slate-50/50' suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
