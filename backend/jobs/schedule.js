// backend/jobs/schedule.js
const cron = require('node-cron');
const { run: computeModeratorScores } = require('./computeModeratorScores');

const SCHEDULE = '0 2 * * *'; // daily at 02:00 UTC
console.log('Scheduling moderator score recompute at', SCHEDULE);
cron.schedule(SCHEDULE, async () => {
  console.log(new Date().toISOString(), 'Starting scheduled moderator score recompute...');
  try {
    await computeModeratorScores();
    console.log(new Date().toISOString(), 'Moderator score recompute completed.');
  } catch (err) {
    console.error(new Date().toISOString(), 'Recompute failed:', err);
  }
}, { scheduled: true, timezone: 'UTC' });

if (require.main === module) {
  console.log('Cron scheduler running. Press Ctrl+C to stop.');
}
