export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  draft:             { label: 'Draft',             color: '#6b7280', bg: 'rgba(107,114,128,0.1)', dot: '#6b7280' },
  submitted:         { label: 'Submitted',         color: '#0284c7', bg: 'rgba(2,132,199,0.1)',   dot: '#0284c7' },
  compliance_review: { label: 'Compliance Review', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  dot: '#7c3aed' },
  action_required:   { label: 'Action Required',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',   dot: '#d97706' },
  approved:          { label: 'Approved',           color: '#059669', bg: 'rgba(5,150,105,0.1)',   dot: '#059669' },
  live:              { label: 'Live',               color: '#10b981', bg: 'rgba(16,185,129,0.1)',  dot: '#10b981' },
};

export const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  operating: { label: 'Operating', icon: '🏦' },
  wire:      { label: 'Wire',      icon: '⚡' },
  ach:       { label: 'ACH',       icon: '🔄' },
  issuing:   { label: 'Issuing',   icon: '💳' },
};
