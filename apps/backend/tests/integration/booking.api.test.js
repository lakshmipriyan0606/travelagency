import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import Booking from '../../src/modules/b2c/bookings/booking.model.js';
import { enqueueBookingIntegrations } from '../../src/modules/b2c/bookings/bookingQueue.service.js';

jest.mock('../../src/modules/b2c/bookings/bookingQueue.service.js', () => ({
  enqueueBookingIntegrations: jest.fn().mockResolvedValue(true),
}));

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
