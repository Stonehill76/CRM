import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LayoutContext } from '../contexts/LayoutContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

export function Layout() {
  const { isMobile, isTablet, isDesktop, isNarrow } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen: isNarrow ? sidebarOpen : true,
        toggleSidebar: () => setSidebarOpen(s => !s),
        closeSidebar: () => setSidebarOpen(false),
        isMobile,
        isTablet,
        isDesktop,
        isNarrow,
      }}
    >
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6f8' }}>
        {/* Backdrop for mobile/tablet sidebar overlay */}
        {isNarrow && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
          />
        )}
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
