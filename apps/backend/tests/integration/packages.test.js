import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '#b2c/users/user.model.js';
import Package from '#b2c/packages/package.model.js';
import Destination from '#b2c/destinations/destination.model.js';
import jwt from 'jsonwebtoken';

describe('Packages API Integration Tests', () => {
  let adminToken;
  let destinationId;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Package.deleteMany({});
    await Destination.deleteMany({});

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin-test@travel.com',
      password: 'hashedpassword',
      role: 'superadmin',
      status: 'Active',
      permissions: ['manage_all'],
    });

    // Generate JWT
    adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create a Destination
    const dest = await Destination.create({
      title: 'Test Destination',
      location: 'Test Location',
      url: 'test-destination',
      orderNumber: 1,
      description: 'Test description',
      imageUrl: 'http://example.com/img.png',
      status: 'Active',
    });
    destinationId = dest._id;
  });

  it('should create a new package via Admin Gateway and fetch it via B2C Gateway', async () => {
    const newPackage = {
      type: 'package',
      packageName: 'Integration Test Package',
      slug: 'integration-test-package',
      packageDescription: 'This is a test package',
      location: destinationId,
      country: 'Test Country',
      packageType: 'Adventure',
      daysAndNights: '5 Days',
      price: 1000,
      status: 'Active',
      images: [{ url: 'http://example.com/test.png' }],
    };

    const res = await request(app)
      .post('/api/v1/b2c-admin/packages/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPackage);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.packageName).toBe('Integration Test Package');

    const fetchRes = await request(app).get('/api/v1/b2c/packages').expect(200);

    expect(fetchRes.body.success).toBe(true);
    expect(fetchRes.body.data.some((p) => p.packageName === 'Integration Test Package')).toBe(true);
  });
});
