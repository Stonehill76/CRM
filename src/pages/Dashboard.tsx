import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { StatusBadge } from '../components/StatusBadge';
import { STATUS_CONFIG } from '../data/applications';
import { getApplications } from '../lib/api';
import { useLayout } from '../contexts/LayoutContext';
import type { Application, ApplicationStatus } from '../types';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 6 }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={accent} />
        </div>
      </div>
      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowUpRight size={13} color={delta >= 0 ? '#34d399' : '#fb7185'} />
          <span style={{ fontSize: 12, color: delta >= 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}

function StatusDistributionBar({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div style={{ marginTop: 6, fontSize: 13, color: '#d1d5db' }}>
        No applications yet.
      </div>
    );
  }

  const counts: Record<string, number> = {};
  applications.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });
  const total = applications.length;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 8, gap: 1 }}>
        {Object.entries(counts).map(([status, count]) => (
          <div
            key={status}
            style={{ flex: count, background: STATUS_CONFIG[status]?.dot || '#9ca3af' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: STATUS_CONFIG[status]?.dot,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {STATUS_CONFIG[status]?.label}{' '}
              <span style={{ color: '#111827', fontWeight: 600 }}>{count}</span>
              <span style={{ color: '#9ca3af' }}> ({Math.round((count / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useLayout();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    getApplications().then(setApplications).catch(() => {});
  }, []);

  const total       = applications.length;
  const pending     = applications.filter(a => a.status === 'submitted').length;
  const approved    = applications.filter(a => a.status === 'approved').length;
  const totalVolume = applications.reduce((s, a) => s + a.monthlyTransactionVolume, 0);
  const recent      = [...applications]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);
  const actionItems = applications.filter(
    a => a.status === 'action_required' || a.status === 'compliance_review'
  );

  const pad = isMobile ? '16px' : '28px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        title="Dashboard"
        subtitle="Banking CRM — Overview"
        actions={
          <button
            onClick={() => navigate('/new-application')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: isMobile ? '8px 12px' : '8px 16px',
              background: 'linear-gradient(135deg, #c41e2d, #a31825)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <FileText size={14} />
            {isMobile ? 'New' : 'New Application'}
          </button>
        }
      />

      <div className="scroll-ios" style={{ flex: 1, padding: `20px ${pad}`, overflowY: 'auto' }}>

        {/* Stats row — 2 cols on mobile, 4 on desktop */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <StatCard label="Total Apps"       value={total}            icon={FileText}     accent="#e8424f" />
          <StatCard label="Pending Review"   value={pending}          icon={Clock}        accent="#fbbf24" />
          <StatCard label="Approved"         value={approved}         icon={CheckCircle2} accent="#34d399" />
          <StatCard label="Monthly Volume"   value={fmt(totalVolume)} icon={DollarSign}   accent="#a78bfa" />
        </div>

        {/* Middle row — side by side on desktop, stacked on mobile/tablet */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 320px' : '1fr',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Pipeline Overview */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Pipeline Overview</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Application status distribution</div>
              </div>
              <Activity size={16} color="#9ca3af" />
            </div>
            <StatusDistributionBar applications={applications} />
          </div>

          {/* Team Workload */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Team Workload</div>
              <Users size={16} color="#9ca3af" />
            </div>
            {[
              { name: 'James Okafor', role: 'RM', count: applications.filter(a => a.assignedTo === 'James Okafor').length, initials: 'JO', color: '#e8424f' },
              { name: 'Priya Nair',   role: 'RM', count: applications.filter(a => a.assignedTo === 'Priya Nair').length,   initials: 'PN', color: '#a78bfa' },
              { name: 'Unassigned',   role: '',   count: applications.filter(a => !a.assignedTo).length,                   initials: '—',  color: '#9ca3af' },
            ].map(member => (
              <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `${member.color}18`,
                    border: `1px solid ${member.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: member.color,
                    flexShrink: 0,
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{member.name}</div>
                  {member.role && <div style={{ fontSize: 11, color: '#9ca3af' }}>{member.role}</div>}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#111827',
                    background: 'rgba(0,0,0,0.06)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {member.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row — stacked on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 320px' : '1fr',
            gap: 12,
          }}
        >
          {/* Recent Applications */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Applications</div>
              <button
                onClick={() => navigate('/applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#e8424f',
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: '#d1d5db' }}>
                No applications yet.{' '}
                <button
                  onClick={() => navigate('/new-application')}
                  style={{ color: '#e8424f', background: 'none', border: 'none', fontSize: 13, fontWeight: 600 }}
                >
                  Create one →
                </button>
              </div>
            ) : isMobile ? (
              /* Mobile card list */
              <div>
                {recent.map((app, i) => (
                  <div
                    key={app.id}
                    onClick={() => navigate('/applications')}
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < recent.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{app.companyName}</div>
                      <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDate(app.submittedAt)}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{fmt(app.monthlyTransactionVolume)}/mo</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop table */
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {['Company', 'Submitted', 'Status', 'Volume'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 20px',
                          textAlign: 'left',
                          fontSize: 11,
                          color: '#9ca3af',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((app, i) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate('/applications')}
                      style={{
                        borderBottom: i < recent.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,30,45,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{app.companyName}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{app.id}</div>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 12.5, color: '#6b7280' }}>
                        {fmtDate(app.submittedAt)}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 13, color: '#111827', fontWeight: 600 }}>
                        {fmt(app.monthlyTransactionVolume)}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Action Required */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertCircle size={15} color="#fbbf24" />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Action Required</div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fbbf24',
                  background: 'rgba(251,191,36,0.12)',
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {actionItems.length}
              </span>
            </div>
            {actionItems.length === 0 ? (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>No action items.</div>
            ) : (
              actionItems.map(app => (
                <div
                  key={app.id}
                  style={{
                    background: '#f8f9fb',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{app.companyName}</div>
                    <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{app.id}</div>
                  {app.notes && (
                    <div style={{ fontSize: 11.5, color: '#9ca3af', lineHeight: 1.5 }}>{app.notes}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 6 }}>
                    Assigned: {app.assignedTo || 'Unassigned'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KPI strip — 2 cols on mobile, 4 on desktop */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 1,
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 20,
          }}
        >
          {[
            { label: 'Avg. Review Time',   value: '3.2 days' },
            { label: 'Approval Rate',      value: total > 0 ? `${Math.round((approved / total) * 100)}%` : '—' },
            { label: 'Intl. Transactions', value: `${applications.filter(a => a.internationalTransactions).length}` },
            { label: 'Total Employees',    value: applications.reduce((s, a) => s + a.employeeCount, 0).toLocaleString() },
          ].map(kpi => (
            <div
              key={kpi.label}
              style={{ background: '#ffffff', padding: '16px 16px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
