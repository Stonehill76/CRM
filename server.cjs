'use strict';

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Database setup ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'crm.db'));

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
    status                    TEXT DEFAULT 'pending_review',
    assignedTo                TEXT DEFAULT '',
    submittedAt               TEXT,
    updatedAt                 TEXT,
    notes                     TEXT DEFAULT ''
  )
`);

// ── Helpers ───────────────────────────────────────────────────────────────────
function fromRow(row) {
  const {
    primaryContactFirstName, primaryContactLastName,
    primaryContactEmail, primaryContactPhone, primaryContactTitle,
    accountTypes, requestedServices, internationalTransactions,
    ...rest
  } = row;
  return {
    ...rest,
    primaryContact: {
      firstName: primaryContactFirstName || '',
      lastName:  primaryContactLastName  || '',
      email:     primaryContactEmail     || '',
      phone:     primaryContactPhone     || '',
      title:     primaryContactTitle     || '',
    },
    accountTypes:             JSON.parse(accountTypes     || '[]'),
    requestedServices:        JSON.parse(requestedServices || '[]'),
    internationalTransactions: internationalTransactions === 1,
  };
}

function generateId() {
  const last = db
    .prepare("SELECT id FROM applications ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1")
    .get();
  if (!last) return 'APP-2401';
  return `APP-${parseInt(last.id.replace('APP-', ''), 10) + 1}`;
}

const VALID_STATUSES = [
  'pending_review', 'in_review', 'approved', 'rejected', 'on_hold', 'documents_needed',
];

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

// POST /api/applications – create new application
app.post('/api/applications', (req, res) => {
  try {
    const d = req.body;
    const now = new Date().toISOString();
    const id  = generateId();

    db.prepare(`
      INSERT INTO applications (
        id, companyName, legalName, businessType, ein, incorporationState,
        yearFounded, industry, website, monthlyRevenue, employeeCount,
        primaryContactFirstName, primaryContactLastName, primaryContactEmail,
        primaryContactPhone, primaryContactTitle,
        accountTypes, requestedServices, monthlyTransactionVolume,
        internationalTransactions, status, assignedTo, submittedAt, updatedAt, notes
      ) VALUES (
        @id, @companyName, @legalName, @businessType, @ein, @incorporationState,
        @yearFounded, @industry, @website, @monthlyRevenue, @employeeCount,
        @firstName, @lastName, @email, @phone, @title,
        @accountTypes, @requestedServices, @monthlyTransactionVolume,
        @internationalTransactions, 'pending_review', '', @now, @now, @notes
      )
    `).run({
      id,
      companyName:              d.companyName              || '',
      legalName:                d.legalName                || '',
      businessType:             d.businessType             || '',
      ein:                      d.ein                      || '',
      incorporationState:       d.incorporationState       || '',
      yearFounded:              parseInt(d.yearFounded)    || 0,
      industry:                 d.industry                 || '',
      website:                  d.website                  || '',
      monthlyRevenue:           parseFloat(d.monthlyRevenue)           || 0,
      employeeCount:            parseInt(d.employeeCount)              || 0,
      firstName:                d.firstName                || '',
      lastName:                 d.lastName                 || '',
      email:                    d.email                    || '',
      phone:                    d.phone                    || '',
      title:                    d.title                    || '',
      accountTypes:             JSON.stringify(d.accountTypes          || []),
      requestedServices:        JSON.stringify(d.requestedServices     || []),
      monthlyTransactionVolume: parseFloat(d.monthlyTransactionVolume) || 0,
      internationalTransactions: d.internationalTransactions ? 1 : 0,
      notes:                    d.additionalNotes          || '',
      now,
    });

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    res.status(201).json(fromRow(row));
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
      return res.status(400).json({ error: 'Invalid status' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE applications SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, id);

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    res.json(fromRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients – approved applications only
app.get('/api/clients', (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM applications WHERE status = 'approved' ORDER BY updatedAt DESC")
      .all();
    res.json(rows.map(fromRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
});
