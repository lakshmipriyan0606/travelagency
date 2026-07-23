# Monitoring & Observability Documentation

## Correlation IDs
Every request is now stamped with an `X-Request-Id` which is included in all structured logs to trace execution across the application.

## Endpoints
- `/api/health`: Validates the backend process is running.
- `/api/health/ready`: Validates MongoDB and Redis connections (Readiness probe).

## Metrics
Prometheus metrics are exposed via the global middleware. Queue depths should be monitored via the Agenda Admin Dashboard or raw MongoDB queries on the `agendaJobs` collection.
