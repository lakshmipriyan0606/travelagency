import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/modules/users/user.model.js';

describe('Auth API Integration Tests', () => {
  const credentials = {
    email: 'test@admin.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin',
  };

  describe('POST /api/v1/b2c/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/b2c/auth/register').send(credentials);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(credentials.email);
    });
  });

  describe('POST /api/v1/b2c-admin/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/b2c/auth/register').send(credentials);
    });

    it('should login successfully and return tokens', async () => {
      const res = await request(app).post('/api/v1/b2c-admin/auth/login').send({
        email: credentials.email,
        password: credentials.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');

      // Check if refresh token is in cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('refresh_token='))).toBeTruthy();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/v1/b2c-admin/auth/login').send({
        email: credentials.email,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/b2c-admin/auth/session', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/b2c/auth/register').send(credentials);
    });

    it('should get session information with valid token', async () => {
      // 1. Login to get token
      const loginRes = await request(app).post('/api/v1/b2c-admin/auth/login').send({
        email: credentials.email,
        password: credentials.password,
      });
      const token = loginRes.body.accessToken;

      // 2. Access protected route
      const res = await request(app)
        .get('/api/v1/b2c-admin/auth/session')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(credentials.email);
    });
  });
});
