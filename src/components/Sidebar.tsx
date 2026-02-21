import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react';

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
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: '#071428',
        borderRight: '1px solid rgba(51,65,85,0.5)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(51,65,85,0.4)',
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
              Vault CRM
            </div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Banking Platform
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
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
              padding: '9px 10px',
              borderRadius: 6,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(196,30,45,0.08)' : 'transparent',
              color: isActive ? '#e8424f' : '#94a3b8',
              borderLeft: isActive ? '2px solid #e8424f' : '2px solid transparent',
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
          borderTop: '1px solid rgba(51,65,85,0.4)',
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
            background: 'linear-gradient(135deg, #1a3a7a, #122a5e)',
            border: '1px solid rgba(196,30,45,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#e8424f',
            flexShrink: 0,
          }}
        >
          JO
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            James Okafor
          </div>
          <div style={{ fontSize: 11, color: '#475569' }}>Relationship Manager</div>
        </div>
      </div>
    </aside>
  );
}
