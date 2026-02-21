import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Users,
  BarChart3,
  Shield,
  X,
} from 'lucide-react';
import { useLayout } from '../contexts/LayoutContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/new-application', label: 'New Application', icon: PlusCircle },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/compliance', label: 'Compliance', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, closeSidebar, isNarrow } = useLayout();
  const location = useLocation();

  // Close sidebar on route change on mobile/tablet
  useEffect(() => {
    if (isNarrow) closeSidebar();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside
      className="safe-bottom"
      style={{
        width: 240,
        minWidth: 240,
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        // On narrow screens: fixed overlay drawer
        ...(isNarrow
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 50,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-260px)',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: sidebarOpen ? '8px 0 32px rgba(0,0,0,0.15)' : 'none',
            }
          : {
              position: 'sticky',
              top: 0,
              flexShrink: 0,
            }),
      }}
    >
      {/* Logo + close button */}
      <div
        style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #c41e2d, #a31825)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 5V11M5 6.5L8 5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              Vault CRM
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Banking Platform
            </div>
          </div>
        </div>
        {/* Close button — only on narrow */}
        {isNarrow && (
          <button
            onClick={closeSidebar}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#f3f4f6',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }} className="scroll-ios">
        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
          Main Menu
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              borderRadius: 6,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(196,30,45,0.07)' : 'transparent',
              color: isActive ? '#c41e2d' : '#4b5563',
              borderLeft: isActive ? '2px solid #c41e2d' : '2px solid transparent',
              minHeight: 44, // 44px minimum tap target
            })}
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(196,30,45,0.08)',
            border: '1px solid rgba(196,30,45,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#c41e2d',
            flexShrink: 0,
          }}
        >
          JO
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            James Okafor
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Relationship Manager</div>
        </div>
      </div>
    </aside>
  );
}
