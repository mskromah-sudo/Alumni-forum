// backend/jobs/computeModeratorScores.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'alumni.db');
const MAX_HOURS = 72;
const TARGET_REVIEWS = 50;

function clamp(v, min=0, max=1){ return Math.max(min, Math.min(max, v)); }

function computeScore({ avg_resolution_hours, reviews_count, reversals }) {
  const avgHours = avg_resolution_hours === null || isNaN(avg_resolution_hours) ? MAX_HOURS : Number(avg_resolution_hours);
  const speed = clamp((MAX_HOURS - avgHours) / MAX_HOURS);
  const throughput = clamp((reviews_count || 0) / TARGET_REVIEWS);
  const accuracy = (reviews_count && reviews_count > 0) ? clamp(1 - (reversals || 0) / reviews_count) : 0;
  const final = 0.45 * speed + 0.35 * accuracy + 0.20 * throughput;
  return Math.round(final * 100);
}

function aggregateModeratorActions(db) {
  const sql = `
    SELECT m.id AS moderator_id, COUNT(a.id) AS reviews_count,
           AVG(a.resolution_hours) AS avg_resolution_hours,
           SUM(CASE WHEN a.outcome = 'reversed' THEN 1 ELSE 0 END) AS reversals
    FROM moderators m
    LEFT JOIN moderator_actions a ON a.moderator_id = m.id
    GROUP BY m.id
  `;
  return new Promise((resolve, reject) => db.all(sql, [], (err, rows) => err ? reject(err) : resolve(rows)));
}

function upsertModeratorStat(db, moderatorId, reviewsCount, avgResolutionHours, accuracyScore) {
  const stmt = `
    INSERT INTO moderator_stats (moderator_id, reviews_count, avg_resolution_hours, accuracy_score, last_updated)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(moderator_id) DO UPDATE SET
      reviews_count = excluded.reviews_count,
      avg_resolution_hours = excluded.avg_resolution_hours,
      accuracy_score = excluded.accuracy_score,
      last_updated = excluded.last_updated
  `;
  return new Promise((resolve, reject) => {
    db.run(stmt, [moderatorId, reviewsCount, avgResolutionHours, accuracyScore], (err) => err ? reject(err) : resolve());
  });
}

async function run() {
  const db = new sqlite3.Database(DB_PATH);
  try {
    const rows = await aggregateModeratorActions(db);
    await Promise.all(rows.map(r => {
      const stats = {
        avg_resolution_hours: r.avg_resolution_hours === null ? null : Number(r.avg_resolution_hours),
        reviews_count: Number(r.reviews_count || 0),
        reversals: Number(r.reversals || 0)
      };
      const score = computeScore(stats);
      return upsertModeratorStat(db, r.moderator_id, stats.reviews_count, stats.avg_resolution_hours, score);
    }));
    db.close();
    console.log(`[computeModeratorScores] Updated ${rows.length} moderator_stats entries`);
  } catch (err) {
    db.close();
    console.error('[computeModeratorScores] Error:', err);
    throw err;
  }
}

if (require.main === module) run().catch(() => process.exit(1));
module.exports = { run, computeScore };
