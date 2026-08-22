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
    <html lang="en" className="dark">
      <body className={`${inter.className} awwwards-bg bg-obsidian-950 text-slate-100 min-h-screen relative antialiased selection:bg-indigo-500 selection:text-white`}>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
