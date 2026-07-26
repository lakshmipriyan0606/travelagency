import { jest } from '@jest/globals';

const mockEnqueue = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule('../../src/modules/b2c/bookings/bookingQueue.service.js', () => ({
  enqueueBookingIntegrations: mockEnqueue,
}));

// Dynamically import dependencies after mocking
const request = (await import('supertest')).default;
const mongoose = (await import('mongoose')).default;
const app = (await import('../../src/app.js')).default;
const Booking = (await import('../../src/modules/b2c/bookings/booking.model.js')).default;
const { enqueueBookingIntegrations } =
  await import('../../src/modules/b2c/bookings/bookingQueue.service.js');

describe('Booking API Integration Tests', () => {
  afterEach(async () => {
    await Booking.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /api/v1/b2c/bookings/create', () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      destination: 'Paris',
      packageName: 'Romantic Getaway',
      phone: '1234567890', // satisfy refinement rule
    };

    it('should create a booking and enqueue integrations successfully', async () => {
      const res = await request(app).post('/api/v1/b2c/bookings/create').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('bookingId');

      const savedBooking = await Booking.findOne({ bookingId: res.body.bookingId });
      expect(savedBooking).toBeTruthy();
      expect(savedBooking.destination).toBe('Paris');

      // Verify Agenda Queue was called
      expect(enqueueBookingIntegrations).toHaveBeenCalledTimes(1);
      expect(enqueueBookingIntegrations).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          destination: 'Paris',
        })
      );
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/b2c/bookings/create')
        .send({ name: 'Only Name' });

      expect(res.status).toBe(400); // Because destination and email are required
      expect(enqueueBookingIntegrations).not.toHaveBeenCalled();
    });

    it('should prevent duplicate bookings using idempotency key', async () => {
      const idempotencyKey = 'idemp-key-123';

      const firstRes = await request(app)
        .post('/api/v1/b2c/bookings/create')
        .set('Idempotency-Key', idempotencyKey)
        .send(validPayload);

      expect(firstRes.status).toBe(201);

      const secondRes = await request(app)
        .post('/api/v1/b2c/bookings/create')
        .set('Idempotency-Key', idempotencyKey)
        .send(validPayload);

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.message).toBe('Duplicate request ignored');
      expect(secondRes.body.bookingId).toBe(firstRes.body.bookingId);

      // Ensure it was only queued once
      expect(enqueueBookingIntegrations).toHaveBeenCalledTimes(1);
    });
  });
});
