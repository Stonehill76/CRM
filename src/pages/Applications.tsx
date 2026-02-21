import { useState, useEffect } from 'react';
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
  CheckCircle2,
} from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { StatusBadge } from '../components/StatusBadge';
import { STATUS_CONFIG, ACCOUNT_TYPE_CONFIG } from '../data/applications';
import { getApplications, updateApplicationStatus } from '../lib/api';
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

type SortKey = 'companyName' | 'submittedAt' | 'monthlyTransactionVolume' | 'status';

export function Applications() {
  const navigate = useNavigate();
  const { isMobile, isNarrow } = useLayout();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Application | null>(null);
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    setApproving(true);
    try {
      const updated = await updateApplicationStatus(id, 'approved');
      setApplications(apps => apps.map(a => a.id === updated.id ? updated : a));
      setSelected(updated);
    } finally {
      setApproving(false);
    }
  }

  const filtered = applications.filter(a => {
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
    if (sortKey !== col) return <ChevronDown size={12} color="#9ca3af" />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="#e8424f" /> : <ChevronDown size={12} color="#e8424f" />;
  }

  const TH = ({ label, col, style }: { label: string; col?: SortKey; style?: React.CSSProperties }) => (
    <th
      onClick={col ? () => toggleSort(col) : undefined}
      style={{
        padding: '11px 16px',
        textAlign: 'left',
        fontSize: 11,
        color: col && sortKey === col ? '#e8424f' : '#9ca3af',
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

  const pad = isMobile ? '16px' : '28px';

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
              gap: 6,
              padding: isMobile ? '8px 12px' : '8px 14px',
              background: 'linear-gradient(135deg, #c41e2d, #a31825)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <PlusCircle size={14} />
            {isMobile ? 'New' : 'New'}
          </button>
        }
      />

      <div className="scroll-ios" style={{ flex: 1, padding: `20px ${pad}`, overflowY: 'auto' }}>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {/* Search row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: '10px 12px',
            }}
          >
            <Search size={14} color="#9ca3af" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by company, ID, email..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#111827',
                width: '100%',
              }}
            />
          </div>

          {/* Status filter pills — horizontal scroll on mobile */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <Filter size={12} color="#9ca3af" />
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
                    borderRadius: 20,
                    border: isActive ? `1px solid ${cfg?.color ?? '#e8424f'}60` : '1px solid #e5e7eb',
                    background: isActive ? (cfg?.bg ?? 'rgba(196,30,45,0.08)') : '#ffffff',
                    color: isActive ? (cfg?.color ?? '#e8424f') : '#6b7280',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {s === 'all' ? 'All' : cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table container */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {/* Mobile card list */}
          {isMobile ? (
            <div>
              {loading ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
              ) : paginated.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No applications found</div>
              ) : (
                paginated.map((app, i) => (
                  <div
                    key={app.id}
                    onClick={() => setSelected(selected?.id === app.id ? null : app)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: i < paginated.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      background: selected?.id === app.id ? 'rgba(196,30,45,0.04)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1, marginRight: 8 }}>
                        {app.companyName}
                      </div>
                      <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#e8424f', fontFamily: 'monospace', fontWeight: 600, background: 'rgba(196,30,45,0.08)', padding: '1px 5px', borderRadius: 3 }}>
                        {app.id}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{app.industry}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {app.primaryContact.firstName} {app.primaryContact.lastName}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                        {fmt(app.monthlyTransactionVolume)}/mo
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Desktop table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#f8f9fb' }}>
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
                  {loading ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '48px 22px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        Loading…
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '48px 22px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((app, i) => (
                      <tr
                        key={app.id}
                        style={{
                          borderBottom: i < paginated.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                          transition: 'background 0.12s',
                          background: selected?.id === app.id ? 'rgba(196,30,45,0.04)' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelected(selected?.id === app.id ? null : app)}
                        onMouseEnter={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'rgba(196,30,45,0.025)'; }}
                        onMouseLeave={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#e8424f', fontWeight: 600, background: 'rgba(196,30,45,0.08)', padding: '2px 6px', borderRadius: 3 }}>
                            {app.id}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{app.companyName}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{app.industry}</div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontSize: 13, color: '#374151' }}>
                            {app.primaryContact.firstName} {app.primaryContact.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{app.primaryContact.title}</div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {app.accountTypes.map(t => (
                              <span
                                key={t}
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: '#6b7280',
                                  background: 'rgba(0,0,0,0.06)',
                                  border: '1px solid rgba(0,0,0,0.07)',
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
                        <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                          {fmt(app.monthlyTransactionVolume)}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <StatusBadge status={app.status as ApplicationStatus} size="sm" />
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {fmtDate(app.submittedAt)}
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12.5, color: app.assignedTo ? '#374151' : '#d1d5db' }}>
                          {app.assignedTo || 'Unassigned'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(selected?.id === app.id ? null : app); }}
                            style={{ background: 'none', border: 'none', color: '#d1d5db' }}
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 5,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: page === 1 ? '#d1d5db' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 5,
                      border: p === page ? '1px solid #e8424f40' : '1px solid #e5e7eb',
                      background: p === page ? 'rgba(196,30,45,0.1)' : '#ffffff',
                      color: p === page ? '#e8424f' : '#6b7280',
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
                    padding: '6px 10px',
                    borderRadius: 5,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: page === totalPages ? '#d1d5db' : '#6b7280',
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
              // Full-screen on mobile, 480px on tablet+
              width: isMobile ? '100vw' : isNarrow ? '85vw' : 480,
              height: '100vh',
              background: '#ffffff',
              borderLeft: '1px solid #e5e7eb',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
            }}
          >
            {/* Drawer header */}
            <div
              className="safe-top"
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.companyName}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{selected.id} · {selected.legalName}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#f3f4f6',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: 18,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                ×
              </button>
            </div>

            <div className="scroll-ios" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
              <div style={{ marginBottom: 20 }}>
                <StatusBadge status={selected.status as ApplicationStatus} />
              </div>

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
                    ['Account Types', selected.accountTypes.map(t => ACCOUNT_TYPE_CONFIG[t]?.label ?? t).join(', ')],
                    ['Monthly Volume', fmt(selected.monthlyTransactionVolume)],
                    ['International', selected.internationalTransactions ? 'Yes' : 'No'],
                    ['Services', selected.requestedServices.map(s => s.replace(/_/g, ' ')).join(', ') || 'None'],
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
                <div key={section.title} style={{ marginBottom: 22 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                      paddingBottom: 6,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    {section.title}
                  </div>
                  {section.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: '#9ca3af', flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12.5, color: '#374151', textAlign: 'right', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}

              {selected.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Notes
                  </div>
                  <div
                    style={{
                      background: '#f8f9fb',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#6b7280',
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
              className="safe-bottom"
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#6b7280',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Edit
              </button>

              {selected.status === 'approved' ? (
                <button
                  onClick={() => navigate('/clients')}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 6,
                    border: '1px solid rgba(52,211,153,0.3)',
                    background: 'rgba(52,211,153,0.08)',
                    color: '#34d399',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={14} />
                  Approved — View in Clients
                </button>
              ) : (
                <button
                  disabled={approving}
                  onClick={() => handleApprove(selected.id)}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 6,
                    border: 'none',
                    background: approving ? 'rgba(196,30,45,0.4)' : 'linear-gradient(135deg, #c41e2d, #a31825)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={14} />
                  {approving ? 'Approving…' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        )}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }}
          />
        )}
      </div>
    </div>
  );
}
