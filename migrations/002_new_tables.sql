-- Migration 002: Create authorized_signers, ownership_control_persons, and application_documents tables

CREATE TABLE IF NOT EXISTS authorized_signers (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id      INTEGER NOT NULL REFERENCES applications(id),
  full_legal_name     TEXT    NOT NULL,
  title_role          TEXT,
  date_of_birth       TEXT,
  email               TEXT,
  phone               TEXT,
  gov_id_type         TEXT,
  gov_id_number       TEXT,
  id_issuing_country  TEXT,
  signature_authority INTEGER DEFAULT 0,
  created_at          TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ownership_control_persons (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id        INTEGER NOT NULL REFERENCES applications(id),
  full_legal_name       TEXT    NOT NULL,
  ownership_percentage  REAL,
  role                  TEXT,
  date_of_birth         TEXT,
  residential_address   TEXT,
  gov_id_type           TEXT,
  gov_id_number         TEXT,
  attestation_of_accuracy INTEGER DEFAULT 0,
  created_at            TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS application_documents (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id    INTEGER NOT NULL REFERENCES applications(id),
  document_type     TEXT    NOT NULL,
  original_filename TEXT,
  stored_filename   TEXT,
  file_path         TEXT,
  uploaded_at       TEXT    DEFAULT (datetime('now'))
  -- Future: parsed_data JSON column for OCR/digitization pipeline
);
