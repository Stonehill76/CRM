// ── Status types & constants ────────────────────────────────────────

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'compliance_review'
  | 'action_required'
  | 'approved'
  | 'live';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  compliance_review: 'Compliance Review',
  action_required: 'Action Required',
  approved: 'Approved',
  live: 'Live',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  compliance_review: 'bg-amber-100 text-amber-700',
  action_required: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  live: 'bg-[#c41e2d] text-white',
};

// ── Nested entity interfaces (migration 002) ───────────────────────

export interface AuthorizedSigner {
  id: number;
  application_id: string;
  full_legal_name: string;
  title_role: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  gov_id_type: string | null;
  gov_id_number: string | null;
  id_issuing_country: string | null;
  signature_authority: boolean;
  created_at: string;
}

export interface OwnershipControlPerson {
  id: number;
  application_id: string;
  full_legal_name: string;
  ownership_percentage: number | null;
  role: string | null;
  date_of_birth: string | null;
  residential_address: string | null;
  gov_id_type: string | null;
  gov_id_number: string | null;
  attestation_of_accuracy: boolean;
  created_at: string;
}

export interface ApplicationDocument {
  id: number;
  application_id: string;
  document_type: string;
  original_filename: string | null;
  stored_filename: string | null;
  file_path: string | null;
  uploaded_at: string;
}

// ── Full Application interface (migrations 000 + 001 + 002) ────────

export interface Application {
  // --- Base fields (migration 000) ---
  id: string;
  companyName: string;
  legalName: string;
  businessType: string;
  ein: string;
  incorporationState: string;
  yearFounded: number;
  industry: string;
  website: string;
  monthlyRevenue: number;
  employeeCount: number;
  primaryContactFirstName: string;
  primaryContactLastName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactTitle: string;
  accountTypes: string;
  requestedServices: string;
  monthlyTransactionVolume: number;
  internationalTransactions: boolean;
  status: ApplicationStatus;
  assignedTo: string;
  submittedAt: string | null;
  updatedAt: string | null;
  notes: string;

  // --- Business registration (migration 001) ---
  trade_name: string | null;
  entity_type: string | null;
  country_of_incorporation: string | null;
  state_of_incorporation: string | null;
  date_of_incorporation: string | null;
  business_registration_number: string | null;
  naics_code: string | null;
  business_purpose: string | null;
  website_url: string | null;

  // --- Mailing address (migration 001) ---
  mailing_address_street: string | null;
  mailing_address_city: string | null;
  mailing_address_state: string | null;
  mailing_address_postal: string | null;
  mailing_address_country: string | null;

  // --- Account types (migration 001) ---
  account_type_operating: boolean;
  account_type_settlement: boolean;
  account_type_reserve: boolean;
  virtual_accounts_required: boolean;

  // --- Business operations (migration 001) ---
  intended_use: string | null;
  source_of_funds: string | null;
  expected_monthly_transaction_count: number | null;
  average_transaction_amount: number | null;
  estimated_monthly_dollar_volume: number | null;
  expected_average_balance: number | null;

  // --- Customer information (migration 001) ---
  customers_migrating: string | null;
  transition_plan_available: boolean;
  countries_customers_located: string | null;
  states_customers_located: string | null;
  customer_types: string | null;

  // --- Compliance & risk (migration 001) ---
  high_risk_jurisdictions: boolean;
  sanctioned_countries_involvement: boolean;
  ofac_screening_responsibility: string | null;
  bsa_aml_attestation: boolean;

  // --- Compliance officer (migration 001) ---
  compliance_officer_name: string | null;
  compliance_officer_contact: string | null;
  compliance_controls_description: string | null;
  training_program_available: boolean;

  // --- Attestations & signature (migration 001) ---
  accuracy_attestation: boolean;
  electronic_signature: string | null;
  signature_date: string | null;
  form_step_completed: number;

  // --- Nested arrays (migration 002) ---
  authorized_signers: AuthorizedSigner[];
  ownership_control_persons: OwnershipControlPerson[];
  application_documents: ApplicationDocument[];
}
