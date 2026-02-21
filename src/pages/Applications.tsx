import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { StatusBadge } from '../components/StatusBadge';
import { APPLICATIONS, STATUS_CONFIG, ACCOUNT_TYPE_CONFIG } from '../data/applications';
import type { Application, ApplicationStatus } from '../types';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type SortKey = 'companyName' | 'submittedAt' | 'monthlyTransactionVolume' | 'status';

export function Applications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Application | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = APPLICATIONS.filter(a => {
    const matchSearch =
      a.companyName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.primaryContact.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    let av: string | number = a[sortKey] as string | number;
    let bv: string | number = b[sortKey] as string | number;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} color="#334155" />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="#2dd4bf" /> : <ChevronDown size={12} color="#2dd4bf" />;
  }

  const TH = ({ label, col, style }: { label: string; col?: SortKey; style?: React.CSSProperties }) => (
    <th
      onClick={col ? () => toggleSort(col) : undefined}
      style={{
        padding: '11px 18px',
        textAlign: 'left',
        fontSize: 11,
        color: col && sortKey === col ? '#2dd4bf' : '#475569',
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: col ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {col && <SortIcon col={col} />}
      </span>
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        title="Applications"
        subtitle={`${filtered.length} application${filtered.length !== 1 ? 's' : ''}`}
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
            }}
          >
            <PlusCircle size={14} />
            New
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#0d1f3c',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: 6,
              padding: '8px 12px',
              flex: '1 1 220px',
              maxWidth: 300,
            }}
          >
            <Search size={14} color="#475569" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by company, ID, email..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#e2e8f0',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} color="#475569" />
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Status:</span>
            </div>
            {(['all', ...Object.keys(STATUS_CONFIG)] as Array<'all' | ApplicationStatus>).map(s => {
              const isActive = statusFilter === s;
              const cfg = s !== 'all' ? STATUS_CONFIG[s] : null;
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 5,
                    border: isActive
                      ? `1px solid ${cfg?.color ?? '#2dd4bf'}60`
                      : '1px solid rgba(51,65,85,0.4)',
                    background: isActive
                      ? (cfg?.bg ?? 'rgba(45,212,191,0.08)')
                      : '#0d1f3c',
                    color: isActive ? (cfg?.color ?? '#2dd4bf') : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {s === 'all' ? 'All' : cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: '#0d1f3c',
            border: '1px solid rgba(51,65,85,0.5)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead style={{ borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(4,13,26,0.4)' }}>
                <tr>
                  <TH label="ID" style={{ width: 100 }} />
                  <TH label="Company" col="companyName" />
                  <TH label="Contact" />
                  <TH label="Accounts" />
                  <TH label="Volume/mo" col="monthlyTransactionVolume" />
                  <TH label="Status" col="status" />
                  <TH label="Submitted" col="submittedAt" />
                  <TH label="Assigned" />
                  <TH label="" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px 22px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
                      No applications found
                    </td>
                  </tr>
                ) : (
                  paginated.map((app, i) => (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: i < paginated.length - 1 ? '1px solid rgba(51,65,85,0.2)' : 'none',
                        transition: 'background 0.12s',
                        background: selected?.id === app.id ? 'rgba(45,212,191,0.04)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelected(selected?.id === app.id ? null : app)}
                      onMouseEnter={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'rgba(45,212,191,0.025)'; }}
                      onMouseLeave={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#2dd4bf', fontWeight: 600, background: 'rgba(45,212,191,0.08)', padding: '2px 6px', borderRadius: 3 }}>
                          {app.id}
                        </span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#e2e8f0' }}>{app.companyName}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{app.industry}</div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                          {app.primaryContact.firstName} {app.primaryContact.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{app.primaryContact.title}</div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {app.accountTypes.map(t => (
                            <span
                              key={t}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: '#94a3b8',
                                background: 'rgba(51,65,85,0.3)',
                                border: '1px solid rgba(51,65,85,0.4)',
                                padding: '2px 6px',
                                borderRadius: 3,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {ACCOUNT_TYPE_CONFIG[t]?.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 13.5, fontWeight: 700, color: '#e2e8f0' }}>
                        {fmt(app.monthlyTransactionVolume)}
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {fmtDate(app.submittedAt)}
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 12.5, color: app.assignedTo ? '#cbd5e1' : '#334155' }}>
                        {app.assignedTo || 'Unassigned'}
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(selected?.id === app.id ? null : app); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}
                        >
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: '1px solid rgba(51,65,85,0.3)',
              }}
            >
              <span style={{ fontSize: 12, color: '#475569' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 5,
                    border: '1px solid rgba(51,65,85,0.4)',
                    background: '#071428',
                    color: page === 1 ? '#334155' : '#94a3b8',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 5,
                      border: p === page ? '1px solid #2dd4bf40' : '1px solid rgba(51,65,85,0.4)',
                      background: p === page ? 'rgba(45,212,191,0.1)' : '#071428',
                      color: p === page ? '#2dd4bf' : '#94a3b8',
                      cursor: 'pointer',
                      fontWeight: p === page ? 700 : 400,
                      fontSize: 13,
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 5,
                    border: '1px solid rgba(51,65,85,0.4)',
                    background: '#071428',
                    color: page === totalPages ? '#334155' : '#94a3b8',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail drawer */}
        {selected && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 480,
              height: '100vh',
              background: '#071428',
              borderLeft: '1px solid rgba(51,65,85,0.5)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(51,65,85,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{selected.companyName}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{selected.id} · {selected.legalName}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 20, lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Status */}
              <div style={{ marginBottom: 24 }}>
                <StatusBadge status={selected.status as ApplicationStatus} />
              </div>

              {/* Sections */}
              {[
                {
                  title: 'Business Details',
                  rows: [
                    ['Business Type', selected.businessType.replace('_', ' ')],
                    ['EIN', selected.ein],
                    ['State', selected.incorporationState],
                    ['Year Founded', String(selected.yearFounded)],
                    ['Industry', selected.industry],
                    ['Website', selected.website],
                    ['Monthly Revenue', fmt(selected.monthlyRevenue)],
                    ['Employees', String(selected.employeeCount)],
                  ],
                },
                {
                  title: 'Primary Contact',
                  rows: [
                    ['Name', `${selected.primaryContact.firstName} ${selected.primaryContact.lastName}`],
                    ['Title', selected.primaryContact.title],
                    ['Email', selected.primaryContact.email],
                    ['Phone', selected.primaryContact.phone],
                  ],
                },
                {
                  title: 'Banking Details',
                  rows: [
                    ['Account Types', selected.accountTypes.map(t => ACCOUNT_TYPE_CONFIG[t].label).join(', ')],
                    ['Monthly Volume', fmt(selected.monthlyTransactionVolume)],
                    ['International', selected.internationalTransactions ? 'Yes' : 'No'],
                    ['Services', selected.requestedServices.map(s => s.replace(/_/g, ' ')).join(', ')],
                  ],
                },
                {
                  title: 'CRM Info',
                  rows: [
                    ['Assigned To', selected.assignedTo || 'Unassigned'],
                    ['Submitted', fmtDate(selected.submittedAt)],
                    ['Last Updated', fmtDate(selected.updatedAt)],
                  ],
                },
              ].map(section => (
                <div key={section.title} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: '1px solid rgba(51,65,85,0.3)',
                    }}
                  >
                    {section.title}
                  </div>
                  {section.rows.map(([k, v]) => (
                    <div
                      key={k}
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}
                    >
                      <span style={{ fontSize: 12.5, color: '#475569', flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12.5, color: '#cbd5e1', textAlign: 'right', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Notes */}
              {selected.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Notes
                  </div>
                  <div
                    style={{
                      background: 'rgba(15,27,54,0.5)',
                      border: '1px solid rgba(51,65,85,0.3)',
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#94a3b8',
                      lineHeight: 1.6,
                    }}
                  >
                    {selected.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid rgba(51,65,85,0.4)',
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 6,
                  border: '1px solid rgba(51,65,85,0.5)',
                  background: '#0d1f3c',
                  color: '#94a3b8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                style={{
                  flex: 2,
                  padding: '9px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        )}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(4,13,26,0.6)',
              zIndex: 49,
            }}
          />
        )}
      </div>
    </div>
  );
}
