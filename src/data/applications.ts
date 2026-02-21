export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending_review:   { label: 'Pending Review', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8' },
  in_review:        { label: 'In Review',       color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)',  dot: '#2dd4bf' },
  approved:         { label: 'Approved',         color: '#34d399', bg: 'rgba(52,211,153,0.1)',  dot: '#34d399' },
  rejected:         { label: 'Rejected',         color: '#fb7185', bg: 'rgba(251,113,133,0.1)', dot: '#fb7185' },
  on_hold:          { label: 'On Hold',          color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  dot: '#fbbf24' },
  documents_needed: { label: 'Docs Needed',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', dot: '#a78bfa' },
};

export const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  operating: { label: 'Operating', icon: '🏦' },
  wire:      { label: 'Wire',      icon: '⚡' },
  ach:       { label: 'ACH',       icon: '🔄' },
  issuing:   { label: 'Issuing',   icon: '💳' },
};
