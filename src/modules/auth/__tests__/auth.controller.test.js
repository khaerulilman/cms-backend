import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthController } from '../auth.controller.js';

describe('AuthController', () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      register: vi.fn(),
      login: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
    };

    controller = new AuthController();
    controller.service = mockService;

    mockReq = {
      user: { id: 'user-123', email: 'test@example.com' },
      params: {},
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      redirect: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('register', () => {
    it('should return 201 with user data and tokens', async () => {
      mockReq.body = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        name: 'New User',
      };

      const mockServiceResult = {
        user: {
          id: 'user-456',
          email: 'newuser@example.com',
          name: 'New User',
          createdAt: new Date('2025-01-15'),
        },
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      };

      mockService.register.mockResolvedValue(mockServiceResult);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockService.register).toHaveBeenCalledWith(
        'newuser@example.com',
        'securepassword123',
        'New User',
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockServiceResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };

      const error = new Error('Service error');
      mockService.register.mockRejectedValue(error);

      await controller.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return 200 with user data and tokens', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'securepassword123',
      };

      const mockServiceResult = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date('2025-01-15'),
        },
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      };

      mockService.login.mockResolvedValue(mockServiceResult);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockService.login).toHaveBeenCalledWith(
        'test@example.com',
        'securepassword123',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockServiceResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockService.login.mockRejectedValue(error);

      await controller.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return 200 with new tokens', async () => {
      mockReq.body = {
        refreshToken: 'refresh_token_123',
      };

      const mockServiceResult = {
        accessToken: 'new_access_token_123',
        refreshToken: 'new_refresh_token_123',
      };

      mockService.refreshToken.mockResolvedValue(mockServiceResult);

      await controller.refreshToken(mockReq, mockRes, mockNext);

      expect(mockService.refreshToken).toHaveBeenCalledWith(
        'refresh_token_123',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: mockServiceResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      mockReq.body = {
        refreshToken: 'invalid_token',
      };

      const error = new Error('Invalid refresh token');
      mockService.refreshToken.mockRejectedValue(error);

      await controller.refreshToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return 200 with user profile data', async () => {
      const mockServiceResult = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      };

      mockService.getProfile.mockResolvedValue(mockServiceResult);

      await controller.getProfile(mockReq, mockRes, mockNext);

      expect(mockService.getProfile).toHaveBeenCalledWith('user-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockServiceResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('User not found');
      mockService.getProfile.mockRejectedValue(error);

      await controller.getProfile(mockReq, mockRes, mockNext);

      expect(mockService.getProfile).toHaveBeenCalledWith('user-123');
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('googleCallback', () => {
    beforeEach(() => {
      process.env.FRONTEND_URL = 'http://localhost:3000';
    });

    it('should redirect to frontend with encoded user data and tokens', async () => {
      mockReq.user = {
        id: 'google-user-123',
        email: 'user@gmail.com',
        name: 'Google User',
        createdAt: new Date('2025-01-15'),
      };

      // We'll mock JwtUtil indirectly through the result
      const expectedAccessToken = 'access_token_123';
      const expectedRefreshToken = 'refresh_token_123';

      // Mock the JWT generation if needed - for now we'll test the structure
      await controller.googleCallback(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalled();
      const redirectUrl = mockRes.redirect.mock.calls[0][0];

      expect(redirectUrl).toContain('http://localhost:3000/login');
      expect(redirectUrl).toContain('accessToken=');
      expect(redirectUrl).toContain('refreshToken=');
      expect(redirectUrl).toContain('user=');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = null;

      await controller.googleCallback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should call next with error if callback throws', async () => {
      mockReq.user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const error = new Error('Callback error');

      // Mock redirect to throw error
      mockRes.redirect.mockImplementation(() => {
        throw error;
      });

      await controller.googleCallback(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
