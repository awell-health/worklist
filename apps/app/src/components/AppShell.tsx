'use client'
import { useDrawer } from '@/contexts/DrawerContext';
import RightDrawer from './RightDrawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, content, title, closeDrawer } = useDrawer();

  return (
    <div className="relative min-h-screen bg-base-100">
      <main className="flex flex-col h-screen">
        {children}
      </main>
      <RightDrawer 
        open={isOpen} 
        onClose={closeDrawer}
        title={title}
      >
        {content}
      </RightDrawer>
    </div>
  );
}