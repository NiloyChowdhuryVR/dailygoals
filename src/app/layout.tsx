import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProgressProvider } from '@/context/ProgressContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daily Learning Goals | Task Shifting Roadmap Tracker',
  description: 'A modern Next.js daily learning goals application featuring dynamic JSON roadmap parsing, automatic missed day task shifting logic, and progress tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#161616]">
      <body className={`${inter.className} bg-[#161616] text-white min-h-screen relative antialiased selection:bg-indigo-500 selection:text-white m-0 p-0 overflow-x-hidden`}>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
