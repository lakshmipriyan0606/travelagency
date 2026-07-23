/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 }, // Hold at 50 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate must be less than 1%
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
