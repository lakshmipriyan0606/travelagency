import { protectRoute } from '../../src/middleware/auth/auth.middleware.js';
import jwt from 'jsonwebtoken';
import cache from '../../config/cache.js';

jest.mock('jsonwebtoken');
jest.mock('../../config/cache.js', () => ({
  get: jest.fn(),
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no Authorization header is provided', async () => {
    await protectRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Authentication required' })
    );
  });

  it('should return 401 if token is blacklisted', async () => {
    req.headers.authorization = 'Bearer blacklisted_token';
    cache.get.mockResolvedValue(true);

    await protectRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Session expired. Please login again.' })
    );
  });

  it('should return 401 if token is invalid or expired', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    cache.get.mockResolvedValue(false);
    jwt.verify.mockImplementation(() => {
      throw new Error('TokenExpiredError');
    });

    await protectRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid or expired token' })
    );
  });

  it('should call next() if token is valid', async () => {
    req.headers.authorization = 'Bearer valid_token';
    cache.get.mockResolvedValue(false);
    jwt.verify.mockReturnValue({ id: 'user123', role: 'admin' });

    await protectRoute(req, res, next);
    expect(req.user).toEqual({ id: 'user123', role: 'admin' });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
