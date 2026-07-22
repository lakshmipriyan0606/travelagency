import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Authentication is CPU heavy (bcrypt)
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/admin';

export default function () {
  // Test: Auth Registration & Login (CPU-heavy)
  const user = {
    email: `loadtest_${randomString(8)}@example.com`,
    password: 'password123',
    name: 'Load Test User',
  };

  const registerRes = http.post(`${BASE_URL}/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(registerRes, {
    'registered successfully': (r) => r.status === 201,
  });

  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: user.email, password: user.password }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'logged in successfully': (r) => r.status === 200,
    'has access token': (r) => r.json('accessToken') !== undefined,
  });

  sleep(1);
}
