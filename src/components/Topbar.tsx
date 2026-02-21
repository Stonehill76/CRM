import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      style={{
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          padding: '7px 12px',
          width: 220,
        }}
      >
        <Search size={14} color="#9ca3af" />
        <input
          placeholder="Search applications..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#4b5563',
            width: '100%',
          }}
        />
        <span style={{ fontSize: 11, color: '#9ca3af', background: '#e5e7eb', padding: '1px 5px', borderRadius: 3 }}>
          ⌘K
        </span>
      </div>

      {/* Notification bell */}
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Bell size={16} color="#6b7280" />
        <span
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#e8424f',
            border: '1.5px solid #ffffff',
          }}
        />
      </button>

      {/* Actions slot */}
      {actions}
    </header>
  );
}
