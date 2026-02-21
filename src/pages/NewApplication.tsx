import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Building2, CreditCard, Layers, ArrowLeft } from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { createApplication } from '../lib/api';
import type { IntakeFormData, AccountType } from '../types';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const BUSINESS_TYPES = [
  { value: 'corporation',       label: 'C Corporation' },
  { value: 'llc',               label: 'LLC' },
  { value: 'partnership',       label: 'Partnership / LP' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'nonprofit',         label: 'Nonprofit' },
];

const INDUSTRIES = [
  'Fintech', 'SaaS / Technology', 'E-Commerce', 'Healthcare', 'Real Estate',
  'Investment Management', 'Venture Capital', 'Transportation & Logistics',
  'Manufacturing', 'Retail', 'Clean Energy', 'Digital Media', 'Other',
];

const ACCOUNT_OPTIONS: { value: AccountType; label: string; description: string; icon: string }[] = [
  { value: 'operating', label: 'Operating Account', description: 'Primary business checking for day-to-day transactions', icon: '🏦' },
  { value: 'wire', label: 'Wire Transfer', description: 'Domestic & international wire origination and receipt', icon: '⚡' },
  { value: 'ach', label: 'ACH Program', description: 'ACH origination, bulk payments, and direct deposit', icon: '🔄' },
  { value: 'issuing', label: 'Card Issuing', description: 'Virtual and physical corporate card programs', icon: '💳' },
];

const SERVICE_OPTIONS = [
  { value: 'fraud_monitoring',   label: 'Fraud Monitoring',       category: 'Risk & Compliance' },
  { value: 'reconciliation_api', label: 'Reconciliation API',     category: 'Developer Tools' },
  { value: 'virtual_accounts',   label: 'Virtual Accounts',       category: 'Account Features' },
  { value: 'sweep_accounts',     label: 'Sweep Accounts',         category: 'Account Features' },
  { value: 'interest_bearing',   label: 'Interest-Bearing',       category: 'Account Features' },
  { value: 'ach_origination',    label: 'ACH Origination',        category: 'Payments' },
  { value: 'wire_origination',   label: 'Wire Origination',       category: 'Payments' },
  { value: 'bulk_payments',      label: 'Bulk Payments',          category: 'Payments' },
  { value: 'expense_cards',      label: 'Expense Cards',          category: 'Card Programs' },
  { value: 'webhooks',           label: 'Webhook Notifications',  category: 'Developer Tools' },
  { value: 'reporting_api',      label: 'Reporting & Analytics API', category: 'Developer Tools' },
];

const INITIAL: IntakeFormData = {
  companyName: '', legalName: '', businessType: '', ein: '',
  incorporationState: '', yearFounded: '', industry: '', website: '',
  monthlyRevenue: '', employeeCount: '',
  firstName: '', lastName: '', email: '', phone: '', title: '',
  accountTypes: [], monthlyTransactionVolume: '', internationalTransactions: false,
  requestedServices: [], additionalNotes: '',
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 5, letterSpacing: '0.02em' }}>
      {children}{required && <span style={{ color: '#e8424f', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 6,
        padding: '9px 12px',
        fontSize: 13.5,
        color: '#111827',
        outline: 'none',
        transition: 'border-color 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={e => (e.target.style.borderColor = '#e8424f')}
      onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.12)')}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 6,
        padding: '9px 12px',
        fontSize: 13.5,
        color: value ? '#111827' : '#9ca3af',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
      }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#ffffff' }}>{o.label}</option>
      ))}
    </select>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
      {children}
    </div>
  );
}

function FormField({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

// ─── Step 1: Business Info ───────────────────────────────────────────────────
function Step1({ data, onChange }: { data: IntakeFormData; onChange: (k: keyof IntakeFormData, v: unknown) => void }) {
  return (
    <div>
      <SectionTitle>Company Information</SectionTitle>
      <FormGrid>
        <FormField>
          <FieldLabel required>Company Name</FieldLabel>
          <Input value={data.companyName} onChange={v => onChange('companyName', v)} placeholder="Meridian Payments" />
        </FormField>
        <FormField>
          <FieldLabel required>Legal Entity Name</FieldLabel>
          <Input value={data.legalName} onChange={v => onChange('legalName', v)} placeholder="Meridian Payments Inc." />
        </FormField>
        <FormField>
          <FieldLabel required>Business Type</FieldLabel>
          <Select value={data.businessType} onChange={v => onChange('businessType', v)} options={BUSINESS_TYPES} placeholder="Select type..." />
        </FormField>
        <FormField>
          <FieldLabel required>EIN / Tax ID</FieldLabel>
          <Input value={data.ein} onChange={v => onChange('ein', v)} placeholder="XX-XXXXXXX" />
        </FormField>
        <FormField>
          <FieldLabel required>State of Incorporation</FieldLabel>
          <Select value={data.incorporationState} onChange={v => onChange('incorporationState', v)} options={US_STATES.map(s => ({ value: s, label: s }))} placeholder="Select state..." />
        </FormField>
        <FormField>
          <FieldLabel required>Year Founded</FieldLabel>
          <Input value={data.yearFounded} onChange={v => onChange('yearFounded', v)} placeholder="2020" type="number" />
        </FormField>
        <FormField>
          <FieldLabel required>Industry</FieldLabel>
          <Select value={data.industry} onChange={v => onChange('industry', v)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} placeholder="Select industry..." />
        </FormField>
        <FormField>
          <FieldLabel>Website</FieldLabel>
          <Input value={data.website} onChange={v => onChange('website', v)} placeholder="company.com" />
        </FormField>
        <FormField>
          <FieldLabel required>Monthly Revenue</FieldLabel>
          <Input value={data.monthlyRevenue} onChange={v => onChange('monthlyRevenue', v)} placeholder="500000" type="number" />
        </FormField>
        <FormField>
          <FieldLabel required>Employee Count</FieldLabel>
          <Input value={data.employeeCount} onChange={v => onChange('employeeCount', v)} placeholder="50" type="number" />
        </FormField>
      </FormGrid>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '24px 0' }} />
      <SectionTitle>Primary Contact</SectionTitle>
      <FormGrid>
        <FormField>
          <FieldLabel required>First Name</FieldLabel>
          <Input value={data.firstName} onChange={v => onChange('firstName', v)} placeholder="Sarah" />
        </FormField>
        <FormField>
          <FieldLabel required>Last Name</FieldLabel>
          <Input value={data.lastName} onChange={v => onChange('lastName', v)} placeholder="Chen" />
        </FormField>
        <FormField>
          <FieldLabel required>Email</FieldLabel>
          <Input value={data.email} onChange={v => onChange('email', v)} placeholder="sarah@company.com" type="email" />
        </FormField>
        <FormField>
          <FieldLabel required>Phone</FieldLabel>
          <Input value={data.phone} onChange={v => onChange('phone', v)} placeholder="+1 415 555 0100" type="tel" />
        </FormField>
        <FormField full>
          <FieldLabel required>Title / Role</FieldLabel>
          <Input value={data.title} onChange={v => onChange('title', v)} placeholder="CFO" />
        </FormField>
      </FormGrid>
    </div>
  );
}

// ─── Step 2: Account Selection ───────────────────────────────────────────────
function Step2({ data, onChange }: { data: IntakeFormData; onChange: (k: keyof IntakeFormData, v: unknown) => void }) {
  function toggleAccount(type: AccountType) {
    const current = data.accountTypes;
    if (current.includes(type)) onChange('accountTypes', current.filter(t => t !== type));
    else onChange('accountTypes', [...current, type]);
  }

  return (
    <div>
      <SectionTitle>Select Account Types</SectionTitle>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
        Choose one or more account products for this client. Multiple selections are supported.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {ACCOUNT_OPTIONS.map(opt => {
          const active = data.accountTypes.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleAccount(opt.value)}
              style={{
                padding: '16px 18px',
                borderRadius: 8,
                border: active ? '1.5px solid #c41e2d' : '1px solid rgba(0,0,0,0.10)',
                background: active ? 'rgba(196,30,45,0.08)' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {active && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#c41e2d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
              )}
              <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#e8424f' : '#111827', marginBottom: 4 }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{opt.description}</div>
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 24 }} />
      <SectionTitle>Transaction Profile</SectionTitle>
      <FormGrid>
        <FormField>
          <FieldLabel required>Expected Monthly Volume ($)</FieldLabel>
          <Input value={data.monthlyTransactionVolume} onChange={v => onChange('monthlyTransactionVolume', v)} placeholder="5000000" type="number" />
        </FormField>
        <FormField>
          <FieldLabel>International Transactions</FieldLabel>
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            {[{ v: false, l: 'No — Domestic Only' }, { v: true, l: 'Yes — International' }].map(opt => (
              <button
                key={String(opt.v)}
                onClick={() => onChange('internationalTransactions', opt.v)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 6,
                  border: data.internationalTransactions === opt.v ? '1.5px solid #c41e2d' : '1px solid rgba(0,0,0,0.10)',
                  background: data.internationalTransactions === opt.v ? 'rgba(196,30,45,0.08)' : '#ffffff',
                  color: data.internationalTransactions === opt.v ? '#e8424f' : '#6b7280',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </FormField>
      </FormGrid>
    </div>
  );
}

// ─── Step 3: Services ────────────────────────────────────────────────────────
function Step3({ data, onChange }: { data: IntakeFormData; onChange: (k: keyof IntakeFormData, v: unknown) => void }) {
  function toggleService(s: string) {
    const curr = data.requestedServices;
    if (curr.includes(s)) onChange('requestedServices', curr.filter(x => x !== s));
    else onChange('requestedServices', [...curr, s]);
  }

  const grouped = SERVICE_OPTIONS.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {} as Record<string, typeof SERVICE_OPTIONS>);

  return (
    <div>
      <SectionTitle>Additional Services</SectionTitle>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
        Select any add-on services the client requires. All selections are optional.
      </p>
      {Object.entries(grouped).map(([category, services]) => (
        <div key={category} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            {category}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {services.map(svc => {
              const active = data.requestedServices.includes(svc.value);
              return (
                <button
                  key={svc.value}
                  onClick={() => toggleService(svc.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: active ? '1.5px solid #c41e2d' : '1px solid rgba(0,0,0,0.07)',
                    background: active ? 'rgba(196,30,45,0.08)' : '#ffffff',
                    color: active ? '#e8424f' : '#6b7280',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {active && <Check size={11} color="#e8424f" strokeWidth={2.5} />}
                  {svc.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '20px 0 24px' }} />
      <SectionTitle>Additional Notes</SectionTitle>
      <textarea
        value={data.additionalNotes}
        onChange={e => onChange('additionalNotes', e.target.value)}
        placeholder="Any special requirements, compliance considerations, or notes for the review team..."
        rows={4}
        style={{
          width: '100%',
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 6,
          padding: '10px 12px',
          fontSize: 13,
          color: '#111827',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.6,
        }}
        onFocus={e => (e.target.style.borderColor = '#e8424f')}
        onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.12)')}
      />
    </div>
  );
}

// ─── Review Summary ───────────────────────────────────────────────────────────
function ReviewSummary({ data }: { data: IntakeFormData }) {
  const sections = [
    {
      title: 'Business',
      rows: [
        ['Company', data.companyName],
        ['Legal Name', data.legalName],
        ['Type', BUSINESS_TYPES.find(b => b.value === data.businessType)?.label || '—'],
        ['EIN', data.ein],
        ['State', data.incorporationState],
        ['Industry', data.industry],
        ['Monthly Revenue', data.monthlyRevenue ? `$${Number(data.monthlyRevenue).toLocaleString()}` : '—'],
      ],
    },
    {
      title: 'Contact',
      rows: [
        ['Name', `${data.firstName} ${data.lastName}`],
        ['Title', data.title],
        ['Email', data.email],
        ['Phone', data.phone],
      ],
    },
    {
      title: 'Accounts & Volume',
      rows: [
        ['Account Types', data.accountTypes.join(', ') || '—'],
        ['Monthly Volume', data.monthlyTransactionVolume ? `$${Number(data.monthlyTransactionVolume).toLocaleString()}` : '—'],
        ['International', data.internationalTransactions ? 'Yes' : 'No'],
      ],
    },
    {
      title: 'Services',
      rows: [
        ['Requested', data.requestedServices.length > 0 ? data.requestedServices.map(s => s.replace(/_/g, ' ')).join(', ') : 'None'],
      ],
    },
  ];

  return (
    <div>
      <div
        style={{
          background: 'rgba(196,30,45,0.05)',
          border: '1px solid rgba(196,30,45,0.2)',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Check size={16} color="#e8424f" />
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Review the details below before submitting. You can go back to make edits.
        </span>
      </div>
      {sections.map(section => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {section.title}
          </div>
          {section.rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 16 }}>
              <span style={{ fontSize: 12.5, color: '#9ca3af' }}>{k}</span>
              <span style={{ fontSize: 12.5, color: '#374151', textAlign: 'right', fontWeight: 500 }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Business Info',      icon: Building2 },
  { label: 'Account Selection',  icon: CreditCard },
  { label: 'Services',           icon: Layers },
];

export function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  function change(key: keyof IntakeFormData, value: unknown) {
    setData(d => ({ ...d, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const app = await createApplication(data);
      setSubmittedId(app.id);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar title="New Application" subtitle="Intake Form" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(196,30,45,0.1)',
                border: '2px solid rgba(196,30,45,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Check size={32} color="#c41e2d" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.03em' }}>
              Application Submitted
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 28 }}>
              <strong style={{ color: '#6b7280' }}>{data.companyName}</strong> has been submitted for review.
              {submittedId && (
                <> Application ID: <span style={{ fontFamily: 'monospace', color: '#e8424f', fontWeight: 700 }}>{submittedId}</span>.</>
              )}{' '}
              It is now in the pending queue and will be assigned to a relationship manager.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setData(INITIAL); setStep(0); setSubmitted(false); }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.10)',
                  background: '#ffffff',
                  color: '#6b7280',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                New Application
              </button>
              <button
                onClick={() => navigate('/applications')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(135deg, #c41e2d, #a31825)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isReview = step === 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar title="New Application" subtitle="Client Intake Form" />
      <div style={{ flex: 1, padding: '32px 0', overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 28px' }}>
          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: done ? 'none' : active ? '2px solid #c41e2d' : '1px solid rgba(0,0,0,0.10)',
                        background: done ? '#c41e2d' : active ? 'rgba(196,30,45,0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {done ? (
                        <Check size={16} color="#fff" strokeWidth={2.5} />
                      ) : (
                        <s.icon size={15} color={active ? '#e8424f' : '#9ca3af'} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: done ? '#e8424f' : active ? '#e8424f' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Step {i + 1}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#111827' : done ? '#6b7280' : '#9ca3af' }}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: done ? '#c41e2d' : 'rgba(0,0,0,0.07)', margin: '0 14px', transition: 'background 0.3s' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 12,
              padding: '28px 32px',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {isReview ? 'Review & Submit' : STEPS[step].label}
              </h2>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>
                {step === 0 && 'Enter company information and primary contact details.'}
                {step === 1 && 'Select the account types and transaction profile.'}
                {step === 2 && 'Choose additional services and add any notes.'}
                {isReview && 'Confirm all information before submitting.'}
              </p>
            </div>

            {step === 0 && <Step1 data={data} onChange={change} />}
            {step === 1 && <Step2 data={data} onChange={change} />}
            {step === 2 && <Step3 data={data} onChange={change} />}
            {isReview && <ReviewSummary data={data} />}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 18px',
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.10)',
                  background: 'transparent',
                  color: '#6b7280',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                {step === 0 ? 'Cancel' : 'Back'}
              </button>
              <button
                disabled={isReview && submitting}
                onClick={isReview ? handleSubmit : () => setStep(s => s + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 22px',
                  borderRadius: 6,
                  border: 'none',
                  background: isReview && submitting
                    ? 'rgba(196,30,45,0.4)'
                    : 'linear-gradient(135deg, #c41e2d, #a31825)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isReview && submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                {isReview ? (submitting ? 'Submitting…' : 'Submit Application') : 'Continue'}
                {!isReview && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
