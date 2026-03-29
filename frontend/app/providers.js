'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { 
            staleTime: 1000 * 60, 
            retry: 1,
            onError: (err) => {
              const msg = err.response?.data?.error || err.message || err;
              console.error('[Query Error]', msg);
            }
          },
          mutations: {
            onError: (err) => {
              const msg = err.response?.data?.error || err.message || err;
              console.error('[Mutation Error]', msg);
            },
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '12px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            success: { 
              iconTheme: { primary: '#6366f1', secondary: '#0f172a' },
              style: { border: '1px solid rgba(99, 102, 241, 0.2)' }
            },
            error: { 
              iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
              style: { border: '1px solid rgba(239, 68, 68, 0.2)' }
            },
            duration: 3000,
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
