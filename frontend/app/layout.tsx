import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Gemini 2.5 Flash · MCP Selenium Agent',
  description: 'Chat-driven browser automation using Gemini and Selenium.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
