// backend/routes/adminReports.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logReportAction } = require('../services/audit');
const DB_PATH = path.join(__dirname, '..', 'alumni.db');

// minimal stubs for auth middleware (replace with real ones)
function authenticate(req, res, next) { req.user = { id: 1, role: 'admin' }; next(); }
function authorizeAdmin(req, res, next) { if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) return next(); res.status(403).json({ error: 'Forbidden' }); }

router.use(authenticate);

// Atomic update route: POST /api/admin/reports/:id/action
router.post('/:id/action', authorizeAdmin, async (req, res) => {
  const reportId = Number(req.params.id);
  const { status, admin_note = null, moderator_id = null, action = 'status_change', outcome = null, details = null } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const db = new sqlite3.Database(DB_PATH);

  try {
    // fetch report to get created_at and old status
    const reportRow = await new Promise((resolve, reject) => {
      db.get('SELECT created_at, status AS old_status FROM reports WHERE id = ?', [reportId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Report not found'));
        resolve(row);
      });
    });

    // prepare statements
    const statements = [];
    const isFinal = ['action_taken', 'dismissed'].includes(status);

    // update reports
    let updateSql = 'UPDATE reports SET status = ?';
    const updateParams = [status];
    if (admin_note !== null) { updateSql += ', admin_note = ?'; updateParams.push(admin_note); }
    if (isFinal) { updateSql += ', resolved_at = CURRENT_TIMESTAMP'; }
    updateSql += ' WHERE id = ?';
    updateParams.push(reportId);
    statements.push({ sql: updateSql, params: updateParams });

    // moderator_actions insert
    if (moderator_id) {
      if (isFinal) {
        const createdAt = new Date(reportRow.created_at);
        const now = new Date();
        const hours = Math.max(0, (now - createdAt) / (1000 * 60 * 60));
        statements.push({
          sql: `INSERT INTO moderator_actions (moderator_id, report_id, action, outcome, resolution_hours, details, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          params: [moderator_id, reportId, action, outcome, hours, details]
        });
      } else {
        statements.push({
          sql: `INSERT INTO moderator_actions (moderator_id, report_id, action, outcome, details, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          params: [moderator_id, reportId, action, outcome, details]
        });
      }
    }

    // audit log
    const actorId = req.user && req.user.id ? req.user.id : null;
    const actorRole = req.user && req.user.role ? req.user.role : (moderator_id ? 'moderator' : 'admin');
    const auditDetails = details || `Status: ${reportRow.old_status} -> ${status}${admin_note ? '; Note: ' + admin_note : ''}`;
    statements.push({
      sql: `INSERT INTO report_audit_log (report_id, actor_id, actor_role, action, details, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [reportId, actorId, actorRole, action, auditDetails]
    });

    // run transaction
    await runTransaction(db, statements);
    db.close();
    return res.json({ message: 'Report updated, moderator_action and audit logged' });
  } catch (err) {
    db.close();
    console.error('[adminReports] atomic update error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// helper to run statements in a single transaction
function runTransaction(db, statements = []) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);
        (async function applyAll() {
          try {
            for (const { sql, params } of statements) {
              await new Promise((res, rej) => {
                db.run(sql, params, function (err) {
                  if (err) return rej(err);
                  res(this);
                });
              });
            }
            db.run('COMMIT', (commitErr) => {
              if (commitErr) return reject(commitErr);
              resolve();
            });
          } catch (e) {
            db.run('ROLLBACK', () => reject(e));
          }
        })();
      });
    });
  });
}

module.exports = router;
