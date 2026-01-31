import { v4 as uuidv4 } from "uuid";
import AuthRepository from "./auth.repository.js";
import HashUtil from "../../utils/hash.js";
import JwtUtil from "../../utils/jwt.js";
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/http.js";

export class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async register(email, password, name) {
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

  async login(email, password) {
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

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const decoded = JwtUtil.verifyToken(refreshToken);
    if (!decoded || decoded.type !== "refresh") {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const user = await this.repository.findUserById(decoded.id);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
    const newRefreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

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
}

export default AuthService;
