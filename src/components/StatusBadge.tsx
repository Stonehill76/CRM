import { STATUS_CONFIG } from '../data/applications';
import type { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const fontSize = size === 'sm' ? 11 : 12;
  const padding = size === 'sm' ? '2px 7px' : '3px 9px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        padding,
        borderRadius: 4,
        border: `1px solid ${config.color}22`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
