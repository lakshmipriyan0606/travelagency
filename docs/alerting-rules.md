# Prometheus Alerting Rules

This document outlines the standard Prometheus Alertmanager rules for the Sastikaa Modular Monolith backend based on our emitted metrics.

## 1. High Memory Usage
Triggers if the Node.js heap usage exceeds 85% for more than 5 minutes.
```yaml
groups:
- name: Backend Resource Alerts
  rules:
  - alert: HighMemoryUsage
    expr: (nodejs_heap_space_size_used_bytes / nodejs_heap_space_size_available_bytes) * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High Memory Usage on Backend"
      description: "Node.js heap is over 85% full for 5 minutes."
```

## 2. Elevated Error Rate
Triggers if the percentage of HTTP 5xx errors exceeds 5% of all traffic over a 5-minute window.
```yaml
  - alert: HighErrorRate
    expr: rate(travelagency_http_requests_total{status=~"5.."}[5m]) / rate(travelagency_http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Elevated 5xx Error Rate"
      description: "More than 5% of requests are failing with 5xx status codes."
```

## 3. High Response Latency
Triggers if the 99th percentile response time is greater than 2 seconds.
```yaml
  - alert: HighResponseLatency
    expr: histogram_quantile(0.99, rate(travelagency_http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High Response Latency (p99 > 2s)"
      description: "The 99th percentile response time is exceeding 2 seconds."
```

## 4. Database Slow Queries
Triggers if the rate of database queries exceeding the slow threshold (100ms) spikes significantly.
```yaml
  - alert: DatabaseSlowQueries
    expr: rate(travelagency_db_query_duration_seconds_count[5m]) > 10
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High volume of slow DB queries"
      description: "Multiple database queries are exceeding expected thresholds."
```

## 5. Application Down
Triggers if Prometheus cannot scrape the metrics endpoint (the process has crashed or is unreachable).
```yaml
  - alert: BackendDown
    expr: up{job="travelagency-backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Backend is unreachable"
      description: "Prometheus failed to scrape the backend metrics endpoint."
```
