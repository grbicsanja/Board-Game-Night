import { ReactNode } from 'react';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const announcement = useAppStore((s) => s.statusAnnouncement);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
