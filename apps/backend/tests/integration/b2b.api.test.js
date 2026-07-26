import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import { Agency } from '#b2b/models/agency.model.js';
import { AgencyUser } from '#b2b/models/agencyUser.model.js';
import { AdminUser } from '#b2b/models/adminUser.model.js';
import { RefreshToken } from '#b2b/models/refreshToken.model.js';
import { AgencyStatusLog } from '#b2b/models/agencyStatusLog.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

describe('B2B Authentication & Lifecycle Integration Tests', () => {
  const agencyPayload = {
    companyName: 'Test Travels Ltd',
    tradeName: 'Test Travels',
    businessType: 'travel_agency',
    registrationNumber: 'REG12345',
    country: 'India',
    gstNumber: '29AAAAA1111A1Z1',
    officeAddress: {
      line1: '123 Main St',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    websiteUrl: 'https://testtravels.com',
    yearsInBusiness: 5,
    iataNumber: 'IATA9999',
    name: 'Agent Owner',
    email: 'owner@testtravels.com',
    phone: '+919999999999',
    designation: 'Managing Director',
    password: 'password123',
  };

  const adminCredentials = {
    email: 'superadmin@sastikaa.com',
    password: 'adminpassword',
  };

  const opsCredentials = {
    email: 'ops@sastikaa.com',
    password: 'opspassword',
  };

  let superadminUser;
  let opsUser;
  let superadminToken;
  let opsToken;

  beforeEach(async () => {
    // 1. Clean up all collections
    await Agency.deleteMany({});
    await AgencyUser.deleteMany({});
    await RefreshToken.deleteMany({});
    await AgencyStatusLog.deleteMany({});
    await AdminUser.deleteMany({});

    // 2. Create seeded admin users
    const salt = 12;
    const superHash = await bcrypt.hash(adminCredentials.password, salt);
    superadminUser = await AdminUser.create({
      name: 'Super Admin',
      email: adminCredentials.email,
      passwordHash: superHash,
      role: 'superadmin',
      isActive: true,
    });

    const opsHash = await bcrypt.hash(opsCredentials.password, salt);
    opsUser = await AdminUser.create({
      name: 'Ops Manager',
      email: opsCredentials.email,
      passwordHash: opsHash,
      role: 'ops',
      isActive: true,
    });

    // 3. Login admins to get fresh tokens
    const resSuper = await request(app).post('/api/b2b/admin/login').send(adminCredentials);
    superadminToken = resSuper.body.accessToken;

    const resOps = await request(app).post('/api/b2b/admin/login').send(opsCredentials);
    opsToken = resOps.body.accessToken;
  });

  describe('1. Agency Registration', () => {
    it('should register a new agency in pending state and create owner user', async () => {
      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.agencyId).toBeDefined();

      const agency = await Agency.findById(res.body.agencyId);
      expect(agency).toBeDefined();
      expect(agency.status).toBe('pending');

      const owner = await AgencyUser.findOne({ email: agencyPayload.email.toLowerCase() });
      expect(owner).toBeDefined();
      expect(owner.role).toBe('owner');
      expect(owner.isActive).toBe(true);
    });

    it('should rollback agency creation if agency user creation fails', async () => {
      // Stub AgencyUser.create to throw a Mongoose ValidationError
      const createSpy = jest.spyOn(AgencyUser, 'create').mockRejectedValueOnce({
        name: 'ValidationError',
        message: 'Mocked validation error',
      });

      const countBefore = await Agency.countDocuments({});

      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);

      expect(res.status).toBe(400); // Validation error
      expect(res.body.error.message).toContain('Mocked validation error');
      const countAfter = await Agency.countDocuments({});
      expect(countAfter).toBe(countBefore); // Rollback cleaned up agency document

      createSpy.mockRestore();
    });

    it('should reject registration if email is already taken', async () => {
      // Create existing owner first
      await request(app).post('/api/b2b/agency/register').send(agencyPayload);

      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);
      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain('Email already registered');
    });
  });

  describe('2. B2B Authentication', () => {
    let agencyId;

    beforeEach(async () => {
      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);
      agencyId = res.body.agencyId;
    });

    it('should reject login for pending, rejected, and suspended agencies', async () => {
      const loginPayload = { email: agencyPayload.email, password: agencyPayload.password };

      // Pending
      let loginRes = await request(app).post('/api/b2b/agency/login').send(loginPayload);
      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.message).toContain('pending approval');

      // Rejected
      await Agency.findByIdAndUpdate(agencyId, {
        status: 'rejected',
        rejectionReason: 'Bad documents',
      });
      loginRes = await request(app).post('/api/b2b/agency/login').send(loginPayload);
      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.message).toContain('rejected');
      expect(loginRes.body.error.message).toContain('Bad documents');

      // Suspended
      await Agency.findByIdAndUpdate(agencyId, { status: 'suspended' });
      loginRes = await request(app).post('/api/b2b/agency/login').send(loginPayload);
      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.message).toContain('suspended');
    });

    it('should allow login once agency status is active', async () => {
      const loginPayload = { email: agencyPayload.email, password: agencyPayload.password };
      await Agency.findByIdAndUpdate(agencyId, { status: 'active' });

      const loginRes = await request(app).post('/api/b2b/agency/login').send(loginPayload);
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.accessToken).toBeDefined();
      expect(loginRes.body.refreshToken).toBeDefined();
    });

    it('should reject token refresh if token scope does not match endpoint', async () => {
      // Get valid admin refresh token
      const adminLoginRes = await request(app).post('/api/b2b/admin/login').send(adminCredentials);
      const adminRefresh = adminLoginRes.body.refreshToken;

      // Try refreshing via agency refresh endpoint
      const refreshRes = await request(app)
        .post('/api/b2b/agency/refresh')
        .send({ refreshToken: adminRefresh });

      expect(refreshRes.status).toBe(401);
    });
  });

  describe('3. Lifecycle Transitions (409 checks)', () => {
    let agencyId;

    beforeEach(async () => {
      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);
      agencyId = res.body.agencyId;
    });

    it('approve should fail if not pending', async () => {
      await Agency.findByIdAndUpdate(agencyId, { status: 'active' });
      const res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/approve`)
        .set('Authorization', `Bearer ${superadminToken}`);
      expect(res.status).toBe(409);
    });

    it('reject should fail if not pending', async () => {
      await Agency.findByIdAndUpdate(agencyId, { status: 'active' });
      const res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/reject`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ reason: 'Rejected docs' });
      expect(res.status).toBe(409);
    });

    it('suspend should fail if not active', async () => {
      const res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/suspend`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ reason: 'Suspicious activity' });
      expect(res.status).toBe(409); // pending -> suspend not allowed
    });

    it('reactivate should fail if not suspended', async () => {
      const res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/reactivate`)
        .set('Authorization', `Bearer ${superadminToken}`);
      expect(res.status).toBe(409); // pending -> reactivate not allowed
    });

    it('should revoke all user refresh tokens when agency is suspended', async () => {
      // 1. Activate agency and login to get refresh token
      await Agency.findByIdAndUpdate(agencyId, { status: 'active' });
      const loginPayload = { email: agencyPayload.email, password: agencyPayload.password };
      const loginRes = await request(app).post('/api/b2b/agency/login').send(loginPayload);
      const refresh = loginRes.body.refreshToken;

      // Ensure refresh works initially
      let refRes = await request(app)
        .post('/api/b2b/agency/refresh')
        .send({ refreshToken: refresh });
      expect(refRes.status).toBe(200);

      // 2. Suspend agency
      await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/suspend`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ reason: 'Suspended check' });

      // 3. Confirm refresh fails now
      refRes = await request(app).post('/api/b2b/agency/refresh').send({ refreshToken: refresh });
      expect(refRes.status).toBe(401);
    });

    it('should log status changes and retrieve logs in newest-first order', async () => {
      // Log 1: pending -> active (approve)
      await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/approve`)
        .set('Authorization', `Bearer ${superadminToken}`);

      // Log 2: active -> suspended (suspend)
      await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/suspend`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ reason: 'suspension log check' });

      // Log 3: suspended -> active (reactivate)
      await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/reactivate`)
        .set('Authorization', `Bearer ${superadminToken}`);

      const logsRes = await request(app)
        .get(`/api/b2b/admin/agencies/${agencyId}/status-log`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(logsRes.status).toBe(200);
      expect(logsRes.body.data.length).toBe(3);
      expect(logsRes.body.data[0].toStatus).toBe('active'); // newest: active (reactivate)
      expect(logsRes.body.data[1].toStatus).toBe('suspended'); // middle: suspended
      expect(logsRes.body.data[2].toStatus).toBe('active'); // oldest: active (approve)
    });
  });

  describe('4. RBAC checks', () => {
    let agencyId;

    beforeEach(async () => {
      const res = await request(app).post('/api/b2b/agency/register').send(agencyPayload);
      agencyId = res.body.agencyId;
    });

    it('ops admin role should be blocked from suspending and reactivating', async () => {
      // Activate first so suspend is valid transition (structurally)
      await Agency.findByIdAndUpdate(agencyId, { status: 'active' });

      // Try suspend with ops token
      let res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/suspend`)
        .set('Authorization', `Bearer ${opsToken}`)
        .send({ reason: 'Ops try suspend' });

      expect(res.status).toBe(403); // Forbidden for ops

      // Suspend with superadmin
      await Agency.findByIdAndUpdate(agencyId, { status: 'suspended' });

      // Try reactivate with ops token
      res = await request(app)
        .patch(`/api/b2b/admin/agencies/${agencyId}/reactivate`)
        .set('Authorization', `Bearer ${opsToken}`);

      expect(res.status).toBe(403); // Forbidden for ops
    });
  });

  describe('5. Rate Limiter', () => {
    it('should rate limit login attempts after 5 consecutive failures', async () => {
      const badCredentials = { email: 'badagent@testtravels.com', password: 'wrongpassword' };

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        const res = await request(app).post('/api/b2b/agency/login').send(badCredentials);
        expect(res.status).toBe(401);
      }

      // The 6th attempt should return 429 Too Many Requests
      const res = await request(app).post('/api/b2b/agency/login').send(badCredentials);
      expect(res.status).toBe(429);
    });
  });
});
