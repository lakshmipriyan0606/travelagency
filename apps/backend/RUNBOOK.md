# Backend Disaster Recovery Runbook

## 1. Application Server Outage
**Symptoms:** 502 Bad Gateway, API timeouts.
**Recovery Steps:**
1. Check PM2 logs: `pm2 logs travelagency-backend`
2. If application crashed continuously, rollback to the previous deployment via GitHub Actions (re-run previous successful `cd.yml` workflow).
3. If memory limits reached, PM2 automatically restarts. If it restarts > 5 times a minute, investigate recent code pushes for memory leaks.

## 2. MongoDB Outage
**Symptoms:** Logs show "MongoNetworkError" or "Connection Refused", 500 errors across most endpoints.
**Recovery Steps:**
1. Verify database cluster status in MongoDB Atlas.
2. If primary node failed over, no action needed; Mongoose will reconnect automatically.
3. If data corruption occurred, initiate a Point-In-Time Restore from the Atlas Dashboard to a timestamp prior to corruption.
4. Scale up cluster tier if outage is CPU/IOPS related.

## 3. Redis Outage
**Symptoms:** "Redis connection error" in logs, slower API responses (cache misses).
**Recovery Steps:**
1. The API is designed to fail open if Redis is down (requests fall back to MongoDB).
2. Check Redis instance health and memory limits.
3. Restart the Redis service.
4. Monitor MongoDB load, as it will handle all cache misses until Redis recovers.

## 4. Background Queue Outage (Agenda)
**Symptoms:** Emails not sending, Google Sheets not syncing.
**Recovery Steps:**
1. Ensure the PM2 cluster is running.
2. Check `agendaJobs` collection in MongoDB for dead-locked jobs.
3. Restart the background worker process if Agenda stalled: `pm2 restart travelagency-backend`
