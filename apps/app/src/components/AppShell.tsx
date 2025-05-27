'use client'
import { useDrawer } from '@/contexts/DrawerContext';
import Drawer from './Drawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, content, title, closeDrawer } = useDrawer();

  return (
    <>
      <div className="drawer lg:drawer-open h-screen">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col h-full">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          </header>
          <main className="flex-1 overflow-y-auto bg-base-200">
            <div className="flex flex-col h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>

    // <div className="drawer drawer-end flex min-h-screen w-full flex-col bg-muted/40">
    //   <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
    //   <div className="drawer-content grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
    //     {children}
    //   </div>
    //   <Drawer open={isOpen} onClose={closeDrawer} title={title}>
    //     {content}
    //   </Drawer>
    // </div>

  );
  //   <div className="relative min-h-screen bg-base-100">
  //     <main className="p-4">
  //       {children}
  //     </main>
  //     <RightDrawer 
  //       open={isOpen} 
  //       onClose={closeDrawer}
  //       title={title}
  //     >
  //       {content}
  //     </RightDrawer>
  //   </div>
  // );
}