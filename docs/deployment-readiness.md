# Deployment Readiness Assessment

This document assesses the Sastikaa backend for production readiness in containerized (Docker/Kubernetes) and clustered (PM2) environments.

## 1. Environment Separation
- **Status**: Ready.
- **Details**: The application strictly relies on the `.env` file (or injected environment variables). Code logic is identical across Staging and Production; only the `NODE_ENV`, `MONGO_URI`, and `SENTRY_DSN` change.

## 2. Docker & Kubernetes Probes
- **Liveness Probe**: Point to `GET /health/live`. Expected response is 200. If this fails 3 times consecutively, Kubernetes will kill and restart the pod.
- **Readiness Probe**: Point to `GET /health/ready`. Expected response is 200. If MongoDB disconnects, this will return 503, causing the Load Balancer to temporarily stop routing traffic to this specific instance without killing the container.

## 3. Graceful Shutdown & Zero-Downtime
- **Status**: Ready.
- **Details**: `server.js` correctly traps `SIGINT` and `SIGTERM`. It stops accepting new HTTP connections, waits for existing ones to finish, safely halts the Agenda worker queue, and cleanly disconnects from MongoDB and Redis before exiting. This perfectly aligns with Kubernetes Rolling Updates to achieve zero-downtime deployments.

## 4. Resource Limits (Kubernetes Example)
- **CPU**: Node.js is single-threaded. Setting a CPU limit of `1000m` (1 core) is highly recommended.
- **Memory**: Set a memory limit of `512Mi` to `1Gi` depending on image upload volume. If memory limits are hit, the container will OOMKill; ensure Node.js is started with `--max-old-space-size=450` if limiting to 512Mi to prevent v8 from over-allocating.
