import { jest } from '@jest/globals';

const mockVerify = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule('#b2c/users/user.model.js', () => ({
  default: {
    findById: mockFindById,
  },
}));

const { protectRoute } = await import('../../src/modules/b2c/middleware/auth.middleware.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no access token cookie is provided', async () => {
    await protectRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unauthorized: No Token' })
    );
  });

  it('should return 401 if token is invalid or expired', async () => {
    req.cookies.access_token = 'invalid_token';
    mockVerify.mockImplementation(() => {
      throw new Error('TokenExpiredError');
    });

    await protectRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid or expired token' })
    );
  });

  it('should call next() if token is valid', async () => {
    req.cookies.access_token = 'valid_token';
    mockVerify.mockReturnValue({ id: 'user123' });
    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'user123', name: 'John Doe' }),
    });

    await protectRoute(req, res, next);
    expect(req.user).toEqual({ _id: 'user123', name: 'John Doe' });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
