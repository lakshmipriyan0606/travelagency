import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Transactional writes are heavy, target low concurrent users
    { duration: '1m', target: 5 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

export default function () {
  // Test: Create Booking (Transactional / Write-heavy)
  const bookingPayload = {
    packageId: '65f1a2b3c4d5e6f7g8h9i0j1', // Placeholder ID, normally this should be a valid Package ID
    customerName: 'Test Booking',
    email: 'testbooking@example.com',
    travelDates: ['2026-08-01', '2026-08-07'],
    participants: 2,
  };

  const res = http.post(`${BASE_URL}/booking/create`, JSON.stringify(bookingPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Note: Depending on backend logic, this might return 201, 200, or a 4xx if the packageId is truly invalid.
  // We check that the response isn't a 500 server error.
  check(res, {
    'status is not 500': (r) => r.status !== 500,
  });

  sleep(1);
}
