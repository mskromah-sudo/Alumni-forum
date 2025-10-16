BEGIN TRANSACTION;

ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE reports ADD COLUMN admin_note TEXT;
ALTER TABLE reports ADD COLUMN is_escalated BOOLEAN DEFAULT 0;
ALTER TABLE reports ADD COLUMN resolved_at DATETIME;

CREATE TABLE IF NOT EXISTS moderator_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  moderator_id INTEGER NOT NULL,
  report_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT,
  resolution_hours REAL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moderator_id) REFERENCES moderators(id),
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS moderator_stats (
  moderator_id INTEGER PRIMARY KEY,
  reviews_count INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  avg_resolution_hours REAL,
  accuracy_score REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moderator_id) REFERENCES moderators(id)
);

CREATE TABLE IF NOT EXISTS report_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  actor_id INTEGER NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_escalated ON reports(is_escalated);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_moderator ON moderator_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_report ON moderator_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderator_stats_last_updated ON moderator_stats(last_updated);
CREATE INDEX IF NOT EXISTS idx_audit_report_created_at ON report_audit_log(report_id, created_at);

COMMIT;
