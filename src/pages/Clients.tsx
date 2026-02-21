import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ExternalLink } from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { ACCOUNT_TYPE_CONFIG } from '../data/applications';
import { getClients } from '../lib/api';
import type { Application } from '../types';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    getClients()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.primaryContact.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        title="Clients"
        subtitle={`${filtered.length} active client${filtered.length !== 1 ? 's' : ''}`}
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: '8px 12px',
              maxWidth: 320,
            }}
          >
            <Search size={14} color="#475569" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
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
        </div>

        {/* Table */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#f8f9fb' }}>
                <tr>
                  {['Company', 'Contact', 'Accounts', 'Monthly Volume', 'Revenue', 'Approved', 'RM', ''].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '11px 18px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: '#9ca3af',
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 22px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '64px 22px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Users size={20} color="#334155" />
                        </div>
                        <div style={{ fontSize: 14, color: '#9ca3af' }}>
                          {search ? 'No clients match your search.' : 'No clients yet.'}
                        </div>
                        {!search && (
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>
                            Approve an application to add a client.{' '}
                            <button
                              onClick={() => navigate('/applications')}
                              style={{ color: '#e8424f', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                            >
                              Go to Applications →
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((client, i) => (
                    <tr
                      key={client.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                        transition: 'background 0.12s',
                        background: selected?.id === client.id ? 'rgba(52,211,153,0.04)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelected(selected?.id === client.id ? null : client)}
                      onMouseEnter={e => { if (selected?.id !== client.id) e.currentTarget.style.background = 'rgba(52,211,153,0.025)'; }}
                      onMouseLeave={e => { if (selected?.id !== client.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{client.companyName}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{client.industry}</div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontSize: 13, color: '#374151' }}>
                          {client.primaryContact.firstName} {client.primaryContact.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{client.primaryContact.email}</div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {client.accountTypes.map(t => (
                            <span
                              key={t}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: '#34d399',
                                background: 'rgba(52,211,153,0.08)',
                                border: '1px solid rgba(52,211,153,0.2)',
                                padding: '2px 6px',
                                borderRadius: 3,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {ACCOUNT_TYPE_CONFIG[t]?.label ?? t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                        {fmt(client.monthlyTransactionVolume)}
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 13, color: '#6b7280' }}>
                        {fmt(client.monthlyRevenue)}/mo
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 12, color: '#34d399', whiteSpace: 'nowrap' }}>
                        {fmtDate(client.updatedAt)}
                      </td>
                      <td style={{ padding: '13px 18px', fontSize: 12.5, color: client.assignedTo ? '#374151' : '#9ca3af' }}>
                        {client.assignedTo || 'Unassigned'}
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(selected?.id === client.id ? null : client); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
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
        </div>
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
            background: '#ffffff',
            borderLeft: '1px solid #e5e7eb',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{selected.companyName}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{selected.id} · {selected.legalName}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#34d399',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  padding: '3px 9px',
                  borderRadius: 20,
                }}
              >
                ● Active Client
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
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
                title: 'Banking Services',
                rows: [
                  ['Account Types', selected.accountTypes.map(t => ACCOUNT_TYPE_CONFIG[t]?.label ?? t).join(', ')],
                  ['Monthly Volume', fmt(selected.monthlyTransactionVolume)],
                  ['International', selected.internationalTransactions ? 'Yes' : 'No'],
                  ['Services', selected.requestedServices.map(s => s.replace(/_/g, ' ')).join(', ') || 'None'],
                ],
              },
              {
                title: 'Account Info',
                rows: [
                  ['Relationship Manager', selected.assignedTo || 'Unassigned'],
                  ['Approved On', fmtDate(selected.updatedAt)],
                  ['Application ID', selected.id],
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: 24 }}>
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
                  <div
                    key={k}
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}
                  >
                    <span style={{ fontSize: 12.5, color: '#9ca3af', flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 12.5, color: '#374151', textAlign: 'right', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 49,
          }}
        />
      )}
    </div>
  );
}
