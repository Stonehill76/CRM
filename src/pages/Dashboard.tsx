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
        background: '#0d1f3c',
        border: '1px solid rgba(51,65,85,0.5)',
        borderRadius: 10,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 6 }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={accent} />
        </div>
      </div>
      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowUpRight size={13} color={delta >= 0 ? '#34d399' : '#fb7185'} />
          <span style={{ fontSize: 12, color: delta >= 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
          <span style={{ fontSize: 12, color: '#475569' }}>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}

function StatusDistributionBar({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div style={{ marginTop: 6, fontSize: 13, color: '#334155' }}>
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
            style={{
              flex: count,
              background: STATUS_CONFIG[status]?.dot || '#475569',
            }}
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
              }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {STATUS_CONFIG[status]?.label} <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{count}</span>
              <span style={{ color: '#475569' }}> ({Math.round((count / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    getApplications().then(setApplications).catch(() => {});
  }, []);

  const total       = applications.length;
  const pending     = applications.filter(a => a.status === 'pending_review').length;
  const approved    = applications.filter(a => a.status === 'approved').length;
  const totalVolume = applications.reduce((s, a) => s + a.monthlyTransactionVolume, 0);
  const recent      = [...applications]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);
  const actionItems = applications.filter(
    a => a.status === 'documents_needed' || a.status === 'on_hold'
  );

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
              gap: 7,
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            <FileText size={14} />
            New Application
          </button>
        }
      />

      <div style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Applications" value={total}           icon={FileText}     accent="#2dd4bf" />
          <StatCard label="Pending Review"     value={pending}         icon={Clock}        accent="#fbbf24" />
          <StatCard label="Approved"           value={approved}        icon={CheckCircle2} accent="#34d399" />
          <StatCard label="Monthly Volume"     value={fmt(totalVolume)} icon={DollarSign}  accent="#a78bfa" />
        </div>

        {/* Middle row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 28 }}>
          {/* Status distribution */}
          <div
            style={{
              background: '#0d1f3c',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: 10,
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Pipeline Overview</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Application status distribution</div>
              </div>
              <Activity size={16} color="#475569" />
            </div>
            <StatusDistributionBar applications={applications} />
          </div>

          {/* Team */}
          <div
            style={{
              background: '#0d1f3c',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: 10,
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Team Workload</div>
              <Users size={16} color="#475569" />
            </div>
            {[
              { name: 'James Okafor', role: 'RM', count: applications.filter(a => a.assignedTo === 'James Okafor').length, initials: 'JO', color: '#2dd4bf' },
              { name: 'Priya Nair',   role: 'RM', count: applications.filter(a => a.assignedTo === 'Priya Nair').length,   initials: 'PN', color: '#a78bfa' },
              { name: 'Unassigned',   role: '',   count: applications.filter(a => !a.assignedTo).length,                   initials: '—',  color: '#475569' },
            ].map(member => (
              <div
                key={member.name}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
              >
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{member.name}</div>
                  {member.role && <div style={{ fontSize: 11, color: '#475569' }}>{member.role}</div>}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#e2e8f0',
                    background: 'rgba(51,65,85,0.3)',
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

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          {/* Recent applications */}
          <div
            style={{
              background: '#0d1f3c',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px 14px',
                borderBottom: '1px solid rgba(51,65,85,0.4)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Recent Applications</div>
              <button
                onClick={() => navigate('/applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#2dd4bf',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: '32px 22px', textAlign: 'center', fontSize: 13, color: '#334155' }}>
                No applications yet. <button onClick={() => navigate('/new-application')} style={{ color: '#2dd4bf', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create one →</button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                    {['Company', 'Submitted', 'Status', 'Volume'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 22px',
                          textAlign: 'left',
                          fontSize: 11,
                          color: '#475569',
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
                        borderBottom: i < recent.length - 1 ? '1px solid rgba(51,65,85,0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(45,212,191,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 22px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{app.companyName}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{app.id}</div>
                      </td>
                      <td style={{ padding: '12px 22px', fontSize: 12.5, color: '#94a3b8' }}>
                        {fmtDate(app.submittedAt)}
                      </td>
                      <td style={{ padding: '12px 22px' }}>
                        <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                      </td>
                      <td style={{ padding: '12px 22px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                        {fmt(app.monthlyTransactionVolume)}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Action items */}
          <div
            style={{
              background: '#0d1f3c',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: 10,
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={15} color="#fbbf24" />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Action Required</div>
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
              <div style={{ fontSize: 13, color: '#475569' }}>No action items.</div>
            ) : (
              actionItems.map(app => (
                <div
                  key={app.id}
                  style={{
                    background: 'rgba(15,27,54,0.6)',
                    border: '1px solid rgba(51,65,85,0.4)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{app.companyName}</div>
                    <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{app.id}</div>
                  {app.notes && (
                    <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>{app.notes}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>
                    Assigned: {app.assignedTo || 'Unassigned'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'rgba(51,65,85,0.3)',
            border: '1px solid rgba(51,65,85,0.4)',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 28,
          }}
        >
          {[
            { label: 'Avg. Review Time',  value: '3.2 days' },
            { label: 'Approval Rate',     value: total > 0 ? `${Math.round((approved / total) * 100)}%` : '—' },
            { label: 'Intl. Transactions', value: `${applications.filter(a => a.internationalTransactions).length} clients` },
            { label: 'Total Employees',   value: applications.reduce((s, a) => s + a.employeeCount, 0).toLocaleString() },
          ].map(kpi => (
            <div
              key={kpi.label}
              style={{
                background: '#0d1f3c',
                padding: '16px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.03em' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
