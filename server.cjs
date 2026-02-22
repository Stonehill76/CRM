'use strict';

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3001;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());

// ── Database setup ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'crm.db'));
db.pragma('journal_mode = WAL');

db.exec(`
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
    status                    TEXT DEFAULT 'draft',
    assignedTo                TEXT DEFAULT '',
    submittedAt               TEXT,
    updatedAt                 TEXT,
    notes                     TEXT DEFAULT ''
  )
`);

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(UPLOADS_DIR, req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

// ── Helpers ───────────────────────────────────────────────────────────────────

// Boolean integer columns that should be returned as true/false in the API
const BOOL_COLUMNS = [
  'internationalTransactions',
  'account_type_operating', 'account_type_settlement', 'account_type_reserve',
  'virtual_accounts_required', 'transition_plan_available',
  'high_risk_jurisdictions', 'sanctioned_countries_involvement',
  'bsa_aml_attestation', 'training_program_available',
  'accuracy_attestation',
];

function fromRow(row) {
  if (!row) return null;
  const {
    primaryContactFirstName, primaryContactLastName,
    primaryContactEmail, primaryContactPhone, primaryContactTitle,
    accountTypes, requestedServices,
    ...rest
  } = row;

  const out = {
    ...rest,
    primaryContact: {
      firstName: primaryContactFirstName || '',
      lastName:  primaryContactLastName  || '',
      email:     primaryContactEmail     || '',
      phone:     primaryContactPhone     || '',
      title:     primaryContactTitle     || '',
    },
    accountTypes:      JSON.parse(accountTypes      || '[]'),
    requestedServices: JSON.parse(requestedServices || '[]'),
  };

  for (const col of BOOL_COLUMNS) {
    if (col in out) out[col] = out[col] === 1;
  }
  return out;
}

function fromSignerRow(row) {
  if (!row) return null;
  return { ...row, signature_authority: row.signature_authority === 1 };
}

function fromOwnerRow(row) {
  if (!row) return null;
  return { ...row, attestation_of_accuracy: row.attestation_of_accuracy === 1 };
}

function getRelations(id) {
  const signers   = db.prepare('SELECT * FROM authorized_signers WHERE application_id = ? ORDER BY id').all(id).map(fromSignerRow);
  const owners    = db.prepare('SELECT * FROM ownership_control_persons WHERE application_id = ? ORDER BY id').all(id).map(fromOwnerRow);
  const documents = db.prepare('SELECT * FROM application_documents WHERE application_id = ? ORDER BY id').all(id);
  return { authorized_signers: signers, ownership_persons: owners, documents };
}

function generateId() {
  const last = db
    .prepare("SELECT id FROM applications ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1")
    .get();
  if (!last) return 'APP-2401';
  return `APP-${parseInt(last.id.replace('APP-', ''), 10) + 1}`;
}

const VALID_STATUSES = [
  'draft', 'submitted', 'compliance_review', 'action_required', 'approved', 'live',
];

// All writable application columns (used for INSERT and PATCH)
const APP_COLUMNS = [
  'companyName', 'legalName', 'businessType', 'ein', 'incorporationState',
  'yearFounded', 'industry', 'website', 'monthlyRevenue', 'employeeCount',
  'primaryContactFirstName', 'primaryContactLastName', 'primaryContactEmail',
  'primaryContactPhone', 'primaryContactTitle',
  'accountTypes', 'requestedServices', 'monthlyTransactionVolume',
  'internationalTransactions', 'assignedTo', 'notes',
  // New columns from migration 001
  'trade_name', 'entity_type', 'country_of_incorporation', 'state_of_incorporation',
  'date_of_incorporation', 'business_registration_number', 'naics_code',
  'business_purpose', 'website_url',
  'mailing_address_street', 'mailing_address_city', 'mailing_address_state',
  'mailing_address_postal', 'mailing_address_country',
  'account_type_operating', 'account_type_settlement', 'account_type_reserve',
  'virtual_accounts_required', 'intended_use', 'source_of_funds',
  'expected_monthly_transaction_count', 'average_transaction_amount',
  'estimated_monthly_dollar_volume', 'expected_average_balance',
  'customers_migrating', 'transition_plan_available',
  'countries_customers_located', 'states_customers_located', 'customer_types',
  'high_risk_jurisdictions', 'sanctioned_countries_involvement',
  'ofac_screening_responsibility', 'bsa_aml_attestation',
  'compliance_officer_name', 'compliance_officer_contact',
  'compliance_controls_description', 'training_program_available',
  'accuracy_attestation', 'electronic_signature', 'signature_date',
  'form_step_completed',
];

// JSON columns that need JSON.stringify before storage
const JSON_COLUMNS = ['accountTypes', 'requestedServices'];

// Integer columns that need parseInt
const INT_COLUMNS = [
  'yearFounded', 'employeeCount', 'expected_monthly_transaction_count',
  'form_step_completed',
];

// Boolean integer columns (truthy → 1, falsy → 0)
const BOOL_INT_COLUMNS = [
  'internationalTransactions',
  'account_type_operating', 'account_type_settlement', 'account_type_reserve',
  'virtual_accounts_required', 'transition_plan_available',
  'high_risk_jurisdictions', 'sanctioned_countries_involvement',
  'bsa_aml_attestation', 'training_program_available', 'accuracy_attestation',
];

// Real/float columns
const REAL_COLUMNS = [
  'monthlyRevenue', 'monthlyTransactionVolume', 'average_transaction_amount',
  'estimated_monthly_dollar_volume', 'expected_average_balance',
];

/** Coerce a request body value for a given column name. */
function coerce(col, val) {
  if (val === undefined || val === null) return null;
  if (JSON_COLUMNS.includes(col))     return JSON.stringify(val);
  if (BOOL_INT_COLUMNS.includes(col)) return val ? 1 : 0;
  if (INT_COLUMNS.includes(col))      return parseInt(val, 10) || 0;
  if (REAL_COLUMNS.includes(col))     return parseFloat(val) || 0;
  return val;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/applications – all applications
app.get('/api/applications', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM applications ORDER BY submittedAt DESC').all();
    res.json(rows.map(fromRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/:id – single application with relations
app.get('/api/applications/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    const app = fromRow(row);
    const relations = getRelations(req.params.id);
    res.json({ ...app, ...relations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/applications – create new application
app.post('/api/applications', (req, res) => {
  try {
    const d = req.body;
    const now = new Date().toISOString();
    const id  = generateId();

    // Determine status: 'submitted' if form is complete, otherwise 'draft'
    const formStep = parseInt(d.form_step_completed, 10) || 1;
    const status = formStep >= 3 ? 'submitted' : 'draft';

    // Build the params object for the application insert
    const params = { id };
    for (const col of APP_COLUMNS) {
      // Support the old flat field names from the original POST body
      let raw;
      if (col === 'primaryContactFirstName') raw = d.primaryContactFirstName ?? d.firstName;
      else if (col === 'primaryContactLastName')  raw = d.primaryContactLastName ?? d.lastName;
      else if (col === 'primaryContactEmail')     raw = d.primaryContactEmail ?? d.email;
      else if (col === 'primaryContactPhone')     raw = d.primaryContactPhone ?? d.phone;
      else if (col === 'primaryContactTitle')     raw = d.primaryContactTitle ?? d.title;
      else if (col === 'notes')                   raw = d.notes ?? d.additionalNotes;
      else raw = d[col];

      params[col] = coerce(col, raw);
    }
    params.status      = status;
    params.submittedAt = status === 'submitted' ? now : null;
    params.updatedAt   = now;

    const colNames = ['id', ...APP_COLUMNS, 'status', 'submittedAt', 'updatedAt'];
    const placeholders = colNames.map(c => `@${c}`).join(', ');

    db.transaction(() => {
      db.prepare(`INSERT INTO applications (${colNames.join(', ')}) VALUES (${placeholders})`).run(params);

      // Insert authorized signers
      if (Array.isArray(d.authorized_signers)) {
        const insertSigner = db.prepare(`
          INSERT INTO authorized_signers (
            application_id, full_legal_name, title_role, date_of_birth,
            email, phone, gov_id_type, gov_id_number, id_issuing_country, signature_authority
          ) VALUES (
            @application_id, @full_legal_name, @title_role, @date_of_birth,
            @email, @phone, @gov_id_type, @gov_id_number, @id_issuing_country, @signature_authority
          )
        `);
        for (const s of d.authorized_signers) {
          insertSigner.run({
            application_id:     id,
            full_legal_name:    s.full_legal_name || '',
            title_role:         s.title_role       || null,
            date_of_birth:      s.date_of_birth    || null,
            email:              s.email            || null,
            phone:              s.phone            || null,
            gov_id_type:        s.gov_id_type      || null,
            gov_id_number:      s.gov_id_number    || null,
            id_issuing_country: s.id_issuing_country || null,
            signature_authority: s.signature_authority ? 1 : 0,
          });
        }
      }

      // Insert ownership/control persons
      if (Array.isArray(d.ownership_persons)) {
        const insertOwner = db.prepare(`
          INSERT INTO ownership_control_persons (
            application_id, full_legal_name, ownership_percentage, role,
            date_of_birth, residential_address, gov_id_type, gov_id_number,
            attestation_of_accuracy
          ) VALUES (
            @application_id, @full_legal_name, @ownership_percentage, @role,
            @date_of_birth, @residential_address, @gov_id_type, @gov_id_number,
            @attestation_of_accuracy
          )
        `);
        for (const o of d.ownership_persons) {
          insertOwner.run({
            application_id:       id,
            full_legal_name:      o.full_legal_name      || '',
            ownership_percentage: o.ownership_percentage != null ? parseFloat(o.ownership_percentage) : null,
            role:                 o.role                  || null,
            date_of_birth:        o.date_of_birth         || null,
            residential_address:  o.residential_address   || null,
            gov_id_type:          o.gov_id_type           || null,
            gov_id_number:        o.gov_id_number         || null,
            attestation_of_accuracy: o.attestation_of_accuracy ? 1 : 0,
          });
        }
      }
    })();

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    const result = fromRow(row);
    const relations = getRelations(id);
    res.status(201).json({ ...result, ...relations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/applications/:id – partial update (no status changes)
app.patch('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Verify application exists
    const existing = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const d = req.body;
    // Reject status changes through this endpoint
    delete d.status;

    const setClauses = [];
    const params = { id };

    for (const col of APP_COLUMNS) {
      if (!(col in d)) continue;
      setClauses.push(`${col} = @${col}`);
      params[col] = coerce(col, d[col]);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const now = new Date().toISOString();
    setClauses.push('updatedAt = @updatedAt');
    params.updatedAt = now;

    db.prepare(`UPDATE applications SET ${setClauses.join(', ')} WHERE id = @id`).run(params);

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    res.json(fromRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/applications/:id/status – update status
app.patch('/api/applications/:id/status', (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const now = new Date().toISOString();
    const updates = { status, updatedAt: now, id };

    // Set submittedAt when moving to submitted for the first time
    if (status === 'submitted') {
      const row = db.prepare('SELECT submittedAt FROM applications WHERE id = ?').get(id);
      if (row && !row.submittedAt) {
        updates.submittedAt = now;
        db.prepare('UPDATE applications SET status = @status, updatedAt = @updatedAt, submittedAt = @submittedAt WHERE id = @id').run(updates);
      } else {
        db.prepare('UPDATE applications SET status = @status, updatedAt = @updatedAt WHERE id = @id').run(updates);
      }
    } else {
      db.prepare('UPDATE applications SET status = @status, updatedAt = @updatedAt WHERE id = @id').run(updates);
    }

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    res.json(fromRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients – approved or live applications
app.get('/api/clients', (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM applications WHERE status IN ('approved', 'live') ORDER BY updatedAt DESC")
      .all();
    res.json(rows.map(fromRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Document endpoints ────────────────────────────────────────────────────────

// POST /api/applications/:id/documents – upload a document
app.post('/api/applications/:id/documents', upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const documentType = req.body.document_type;
    if (!documentType) return res.status(400).json({ error: 'document_type is required' });

    const result = db.prepare(`
      INSERT INTO application_documents (application_id, document_type, original_filename, stored_filename, file_path)
      VALUES (@application_id, @document_type, @original_filename, @stored_filename, @file_path)
    `).run({
      application_id:    id,
      document_type:     documentType,
      original_filename: req.file.originalname,
      stored_filename:   req.file.filename,
      file_path:         req.file.path,
    });

    const doc = db.prepare('SELECT * FROM application_documents WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/:id/documents – list documents
app.get('/api/applications/:id/documents', (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    const docs = db.prepare('SELECT * FROM application_documents WHERE application_id = ? ORDER BY id').all(id);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/applications/:id/documents/:docId – remove document
app.delete('/api/applications/:id/documents/:docId', (req, res) => {
  try {
    const { id, docId } = req.params;

    const doc = db.prepare('SELECT * FROM application_documents WHERE id = ? AND application_id = ?').get(docId, id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Remove file from disk
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    db.prepare('DELETE FROM application_documents WHERE id = ?').run(docId);
    res.json({ message: 'Document deleted', id: Number(docId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Signer endpoints ─────────────────────────────────────────────────────────

// GET /api/applications/:id/signers – list authorized signers
app.get('/api/applications/:id/signers', (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    const rows = db.prepare('SELECT * FROM authorized_signers WHERE application_id = ? ORDER BY id').all(id);
    res.json(rows.map(fromSignerRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/applications/:id/signers – add an authorized signer
app.post('/api/applications/:id/signers', (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    const s = req.body;
    if (!s.full_legal_name) return res.status(400).json({ error: 'full_legal_name is required' });

    const result = db.prepare(`
      INSERT INTO authorized_signers (
        application_id, full_legal_name, title_role, date_of_birth,
        email, phone, gov_id_type, gov_id_number, id_issuing_country, signature_authority
      ) VALUES (
        @application_id, @full_legal_name, @title_role, @date_of_birth,
        @email, @phone, @gov_id_type, @gov_id_number, @id_issuing_country, @signature_authority
      )
    `).run({
      application_id:     id,
      full_legal_name:    s.full_legal_name,
      title_role:         s.title_role       || null,
      date_of_birth:      s.date_of_birth    || null,
      email:              s.email            || null,
      phone:              s.phone            || null,
      gov_id_type:        s.gov_id_type      || null,
      gov_id_number:      s.gov_id_number    || null,
      id_issuing_country: s.id_issuing_country || null,
      signature_authority: s.signature_authority ? 1 : 0,
    });

    const row = db.prepare('SELECT * FROM authorized_signers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(fromSignerRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Ownership / control person endpoints ──────────────────────────────────────

// GET /api/applications/:id/owners – list ownership/control persons
app.get('/api/applications/:id/owners', (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    const rows = db.prepare('SELECT * FROM ownership_control_persons WHERE application_id = ? ORDER BY id').all(id);
    res.json(rows.map(fromOwnerRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/applications/:id/owners – add an ownership/control person
app.post('/api/applications/:id/owners', (req, res) => {
  try {
    const { id } = req.params;

    const appRow = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
    if (!appRow) return res.status(404).json({ error: 'Application not found' });

    const o = req.body;
    if (!o.full_legal_name) return res.status(400).json({ error: 'full_legal_name is required' });

    const result = db.prepare(`
      INSERT INTO ownership_control_persons (
        application_id, full_legal_name, ownership_percentage, role,
        date_of_birth, residential_address, gov_id_type, gov_id_number,
        attestation_of_accuracy
      ) VALUES (
        @application_id, @full_legal_name, @ownership_percentage, @role,
        @date_of_birth, @residential_address, @gov_id_type, @gov_id_number,
        @attestation_of_accuracy
      )
    `).run({
      application_id:       id,
      full_legal_name:      o.full_legal_name,
      ownership_percentage: o.ownership_percentage != null ? parseFloat(o.ownership_percentage) : null,
      role:                 o.role                 || null,
      date_of_birth:        o.date_of_birth        || null,
      residential_address:  o.residential_address  || null,
      gov_id_type:          o.gov_id_type          || null,
      gov_id_number:        o.gov_id_number        || null,
      attestation_of_accuracy: o.attestation_of_accuracy ? 1 : 0,
    });

    const row = db.prepare('SELECT * FROM ownership_control_persons WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(fromOwnerRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
});
