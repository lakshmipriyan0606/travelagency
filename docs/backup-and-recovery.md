# Backup & Recovery Strategy

This document outlines the disaster recovery and backup protocols for the Sastikaa backend infrastructure.

## 1. MongoDB Atlas Backup Strategy
- **Continuous Backups**: MongoDB Atlas is configured for Point-in-Time Recovery (PITR). This allows us to restore the database to any minute within the last 7 days.
- **Snapshot Retention**: Daily snapshots are retained for 30 days. Weekly snapshots are retained for 6 months.
- **RPO (Recovery Point Objective)**: **1 minute**. In the event of a catastrophic database failure or accidental drop, we will lose at most 1 minute of data.
- **RTO (Recovery Time Objective)**: **15-30 minutes**. The time required to restore a cluster from a snapshot and update connection strings in the backend environment.

## 2. Redis Recovery
- **Volatility**: Redis is currently used purely as a cache-aside layer (`node-cache` replacement) and contains no persistent truth.
- **RPO**: Not applicable (Data can be fully rebuilt from MongoDB).
- **RTO**: **Instant**. If the Redis connection drops, the backend is programmed to automatically fallback to reading directly from MongoDB until the Redis node recovers.

## 3. Cloudinary Asset Recovery
- **Backup**: All image assets uploaded via the `Upload` module are stored in Cloudinary. Cloudinary manages its own internal redundancy.
- **Local Fallback**: No local copies of user images are kept on the backend server to maintain statelessness.
- **Secret Compromise**: If the `CLOUDINARY_URL` is leaked, immediately regenerate the API Secret in the Cloudinary Dashboard and update the backend `.env` variables.

## 4. Environment & Secrets Backup
- **Source Control**: All source code is versioned in GitHub. **No secrets (`.env`) are ever committed.**
- **Secret Management**: Production secrets are stored securely within the hosting provider's Secret Manager (e.g., Vercel / Render / AWS Parameter Store).
- **Backup**: A designated Lead Engineer retains an encrypted offline backup of the production `.env` file using a tool like 1Password or Bitwarden.
