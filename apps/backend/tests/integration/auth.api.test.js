import request from 'supertest';
import app from '../../app.js';
import User from '../../src/database/models/user.model.js';

describe('Auth API Integration Tests', () => {
  const credentials = {
    email: 'test@admin.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin',
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/admin/register').send(credentials);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(credentials.email);
  });

  it('should login and return tokens', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: credentials.email,
      password: credentials.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');

    // Check if refresh token is in cookies
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('jwt='))).toBeTruthy();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: credentials.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('should get session information with valid token', async () => {
    // 1. Login to get token
    const loginRes = await request(app).post('/api/admin/login').send({
      email: credentials.email,
      password: credentials.password,
    });
    const token = loginRes.body.accessToken;

    // 2. Access protected route
    const res = await request(app)
      .get('/api/admin/session')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(credentials.email);
  });
});
