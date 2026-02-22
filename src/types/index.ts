export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'compliance_review'
  | 'action_required'
  | 'approved'
  | 'live';

export type AccountType =
  | 'operating'
  | 'wire'
  | 'ach'
  | 'issuing';

export type BusinessType =
  | 'llc'
  | 'corporation'
  | 'sole_proprietorship'
  | 'partnership'
  | 'nonprofit';

export interface Application {
  id: string;
  companyName: string;
  legalName: string;
  businessType: BusinessType;
  ein: string;
  incorporationState: string;
  yearFounded: number;
  industry: string;
  website: string;
  monthlyRevenue: number;
  employeeCount: number;
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
  };
  accountTypes: AccountType[];
  requestedServices: string[];
  monthlyTransactionVolume: number;
  internationalTransactions: boolean;
  status: ApplicationStatus;
  assignedTo: string;
  submittedAt: string;
  updatedAt: string;
  notes: string;
}

export interface IntakeFormData {
  // Step 1 – Business Info
  companyName: string;
  legalName: string;
  businessType: BusinessType | '';
  ein: string;
  incorporationState: string;
  yearFounded: string;
  industry: string;
  website: string;
  monthlyRevenue: string;
  employeeCount: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  // Step 2 – Account Selection
  accountTypes: AccountType[];
  monthlyTransactionVolume: string;
  internationalTransactions: boolean;
  // Step 3 – Services
  requestedServices: string[];
  additionalNotes: string;
}
