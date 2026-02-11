import { v4 as uuidv4 } from "uuid";

import { ERROR_MESSAGES } from "../../constants/http.js";
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from "../../utils/errors.js";
import HashUtil from "../../utils/hash.js";
import JwtUtil from "../../utils/jwt.js";
import logger from "../../utils/logger.js";

import AuthRepository from "./auth.repository.js";

export class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async register(email, password, name, metadata = {}) {
    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await HashUtil.hashPassword(password);

    // Create user with UUID
    const user = await this.repository.createUser({
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
    });

    // Generate tokens
    const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
    const refreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken, metadata);

    logger.info({ userId: user.id, email: user.email }, "User registered");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password, metadata = {}) {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await HashUtil.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
    const refreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken, metadata);

    logger.info({ userId: user.id, email: user.email }, "User logged in");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken, metadata = {}) {
    if (!refreshToken) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // Verify JWT
    const decoded = JwtUtil.verifyToken(refreshToken);
    if (!decoded || decoded.type !== "refresh") {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // Check if token exists and is valid in database
    const storedToken = await this.repository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // Check if token is revoked
    if (storedToken.isRevoked) {
      throw new AuthenticationError(ERROR_MESSAGES.TOKEN_REVOKED);
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      throw new AuthenticationError(ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED);
    }

    const user = await this.repository.findUserById(decoded.id);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Revoke old refresh token (Refresh Token Rotation)
    await this.repository.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
    const newRefreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

    // Store new refresh token
    await this.storeRefreshToken(user.id, newRefreshToken, metadata);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Helper method to store refresh token
  async storeRefreshToken(userId, token, metadata = {}) {
    const decoded = JwtUtil.verifyToken(token);

    return this.repository.createRefreshToken({
      id: uuidv4(),
      userId,
      token,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: metadata.userAgent || null,
      ipAddress: metadata.ipAddress || null,
    });
  }

  // Logout and revoke refresh token
  async logout(refreshToken) {
    if (refreshToken) {
      const storedToken = await this.repository.findRefreshToken(refreshToken);
      if (storedToken && !storedToken.isRevoked) {
        await this.repository.revokeRefreshToken(refreshToken);
        logger.info({ userId: storedToken.userId }, "User logged out");
      }
    }
  }

  // Logout from all devices
  async logoutAllDevices(userId) {
    await this.repository.revokeAllUserTokens(userId);
    logger.info({ userId }, "User logged out from all devices");
  }

  // Get user's active sessions
  async getActiveSessions(userId) {
    const tokens = await this.repository.getUserActiveTokens(userId);
    return tokens.map((token) => ({
      id: token.id,
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }

  // Clean up expired tokens (can be run as cron job)
  async cleanupExpiredTokens() {
    return this.repository.deleteExpiredTokens();
  }
}

export default AuthService;
