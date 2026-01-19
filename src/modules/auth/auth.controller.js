import AuthService from "./auth.service.js";
import JwtUtil from "../../utils/jwt.js";

export class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const result = await this.service.register(email, password, name);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await this.service.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
        });
      }

      // Generate tokens
      const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
      const refreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

      // Encode user data sebagai base64
      const userData = Buffer.from(
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        })
      ).toString("base64");

      // Redirect dengan user data
      const frontendUrl = new URL(`${process.env.FRONTEND_URL}/login`);
      frontendUrl.searchParams.append("accessToken", accessToken);
      frontendUrl.searchParams.append("refreshToken", refreshToken);
      frontendUrl.searchParams.append("user", userData);

      return res.redirect(frontendUrl.toString());
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const result = await this.service.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const profile = await this.service.getProfile(userId);

      return res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
