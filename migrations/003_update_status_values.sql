-- Migration 003: Migrate existing status values to new canonical set
-- New valid statuses: 'draft', 'submitted', 'compliance_review', 'action_required', 'approved', 'live'

-- Map legacy values from original server.cjs schema
UPDATE applications SET status = 'submitted'         WHERE status = 'pending_review';
UPDATE applications SET status = 'compliance_review'  WHERE status = 'in_review';
UPDATE applications SET status = 'action_required'    WHERE status = 'documents_needed';

-- Map values specified in migration spec
UPDATE applications SET status = 'submitted'         WHERE status = 'pending';
UPDATE applications SET status = 'compliance_review'  WHERE status = 'under_review';
UPDATE applications SET status = 'action_required'    WHERE status = 'on_hold';
UPDATE applications SET status = 'action_required'    WHERE status = 'rejected';
UPDATE applications SET status = 'live'               WHERE status = 'active';

-- 'approved' stays as 'approved' — no update needed
