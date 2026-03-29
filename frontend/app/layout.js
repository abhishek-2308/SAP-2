import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'Trello Cello — Kanban Board',
  description: 'A full-featured Trello clone with drag-and-drop, card modals, and real-time updates.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
