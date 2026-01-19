import { v4 as uuidv4 } from "uuid";
import AuthRepository from "./auth.repository.js";
import HashUtil from "../../utils/hash.js";
import JwtUtil from "../../utils/jwt.js";
import Validator from "../../utils/validator.js";
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from "../../utils/errors.js";

export class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async register(email, password, name) {
    // Validate input
    Validator.validateEmail(email);
    Validator.validatePassword(password);
    Validator.validateName(name);

    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("User already exists");
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
    // Validate input
    Validator.validateEmail(email);
    Validator.validatePassword(password);

    // Find user by email
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await HashUtil.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
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
      throw new AuthenticationError("Refresh token is required");
    }

    const decoded = JwtUtil.verifyToken(refreshToken);
    if (!decoded || decoded.type !== "refresh") {
      throw new AuthenticationError("Invalid refresh token");
    }

    const user = await this.repository.findUserById(decoded.id);
    if (!user) {
      throw new NotFoundError("User not found");
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
      throw new NotFoundError("User not found");
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
