// backend/services/audit.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'alumni.db');

function logReportAction({ reportId, actorId, actorRole, action, details }) {
  const db = new sqlite3.Database(DB_PATH);
  const sql = `INSERT INTO report_audit_log (report_id, actor_id, actor_role, action, details) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [reportId, actorId, actorRole, action, details], (err) => {
    if (err) console.error('Audit log error', err);
    db.close();
  });
}

module.exports = { logReportAction };
