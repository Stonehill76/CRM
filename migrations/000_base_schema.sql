-- Migration 000: Baseline schema — mirrors the CREATE TABLE in server.cjs
-- Using CREATE TABLE IF NOT EXISTS so this is safe to run when the server
-- has already created the table.

CREATE TABLE IF NOT EXISTS applications (
  id                        TEXT PRIMARY KEY,
  companyName               TEXT NOT NULL,
  legalName                 TEXT DEFAULT '',
  businessType              TEXT DEFAULT '',
  ein                       TEXT DEFAULT '',
  incorporationState        TEXT DEFAULT '',
  yearFounded               INTEGER DEFAULT 0,
  industry                  TEXT DEFAULT '',
  website                   TEXT DEFAULT '',
  monthlyRevenue            REAL DEFAULT 0,
  employeeCount             INTEGER DEFAULT 0,
  primaryContactFirstName   TEXT DEFAULT '',
  primaryContactLastName    TEXT DEFAULT '',
  primaryContactEmail       TEXT DEFAULT '',
  primaryContactPhone       TEXT DEFAULT '',
  primaryContactTitle       TEXT DEFAULT '',
  accountTypes              TEXT DEFAULT '[]',
  requestedServices         TEXT DEFAULT '[]',
  monthlyTransactionVolume  REAL DEFAULT 0,
  internationalTransactions INTEGER DEFAULT 0,
  status                    TEXT DEFAULT 'pending_review',
  assignedTo                TEXT DEFAULT '',
  submittedAt               TEXT,
  updatedAt                 TEXT,
  notes                     TEXT DEFAULT ''
);
