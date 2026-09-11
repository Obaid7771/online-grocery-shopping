// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'FreshCart Admin', template: '%s | FreshCart Admin' },
  description: 'FreshCart grocery platform admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1F2937', color: '#fff', borderRadius: '8px' },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
