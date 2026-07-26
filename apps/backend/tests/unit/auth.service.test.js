import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

// Mock the User model
const mockCreate = jest.fn();
const mockFindOne = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule('../../src/modules/b2c/users/user.model.js', () => ({
  default: {
    create: mockCreate,
    findOne: mockFindOne,
    findById: mockFindById,
  },
}));

// Import service after mocking
const { registerUser, findUserByEmail, findUserById } =
  await import('#modules/b2c/auth/auth.service.js');

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should hash password and create user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';
      const role = 'user';

      mockCreate.mockResolvedValue({ _id: '1', email, name, role });
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await registerUser(email, password, name, role);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.email).toBe(email);
      expect(callArgs.name).toBe(name);
      expect(callArgs.role).toBe(role);
      expect(callArgs.password).not.toBe(password); // Should be hashed

      const isHashed = await bcrypt.compare(password, callArgs.password);
      expect(isHashed).toBe(true);

      expect(result).toHaveProperty('_id', '1');
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      mockFindOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: '1', email: 'test@example.com' }),
      });
      const result = await findUserByEmail('test@example.com');
      expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com', isDeleted: false });
      expect(result.email).toBe('test@example.com');
    });
  });
});
