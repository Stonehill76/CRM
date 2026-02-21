export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending_review:   { label: 'Pending Review', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', dot: '#6b7280' },
  in_review:        { label: 'In Review',       color: '#0284c7', bg: 'rgba(2,132,199,0.1)',   dot: '#0284c7' },
  approved:         { label: 'Approved',         color: '#059669', bg: 'rgba(5,150,105,0.1)',   dot: '#059669' },
  rejected:         { label: 'Rejected',         color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   dot: '#dc2626' },
  on_hold:          { label: 'On Hold',          color: '#d97706', bg: 'rgba(217,119,6,0.1)',   dot: '#d97706' },
  documents_needed: { label: 'Docs Needed',      color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  dot: '#7c3aed' },
};

export const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  operating: { label: 'Operating', icon: '🏦' },
  wire:      { label: 'Wire',      icon: '⚡' },
  ach:       { label: 'ACH',       icon: '🔄' },
  issuing:   { label: 'Issuing',   icon: '💳' },
};
