import type { Application, ApplicationStatus, IntakeFormData } from '../types';

export async function getApplications(): Promise<Application[]> {
  const res = await fetch('/api/applications');
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function createApplication(data: IntakeFormData): Promise<Application> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create application');
  return res.json();
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  const res = await fetch(`/api/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function getClients(): Promise<Application[]> {
  const res = await fetch('/api/clients');
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}
