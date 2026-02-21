import { createContext, useContext } from 'react';

interface LayoutContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isNarrow: boolean;
}

export const LayoutContext = createContext<LayoutContextValue>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isNarrow: false,
});

export const useLayout = () => useContext(LayoutContext);
