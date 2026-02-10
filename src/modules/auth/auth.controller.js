import { config } from "../../config/env.js";
import {
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../../constants/http.js";
import JwtUtil from "../../utils/jwt.js";

import AuthService from "./auth.service.js";

// Detect if frontend and backend are on different sites (cross-site)
// Cross-site cookies require SameSite=None and Secure=true
const isCrossSite = (() => {
  try {
    const frontendHost = new URL(config.FRONTEND_URL).hostname;
    const backendHost = config.GOOGLE_CALLBACK_URL
      ? new URL(config.GOOGLE_CALLBACK_URL).hostname
      : null;
    return backendHost ? frontendHost !== backendHost : false;
  } catch {
    return false;
  }
})();

// Cookie options for HTTP-only cookies
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isCrossSite || config.NODE_ENV === "production",
  sameSite: isCrossSite
    ? "none"
    : config.NODE_ENV === "production"
      ? "strict"
      : "lax",
  maxAge,
  path: "/",
});

export class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  // Helper method to get client metadata
  getClientMetadata(req) {
    return {
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip || req.connection?.remoteAddress || null,
    };
  }

  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const result = await this.service.register(
        email,
        password,
        name,
        this.getClientMetadata(req),
      );

      // Set HTTP-only cookies
      res.cookie(
        "accessToken",
        result.accessToken,
        getCookieOptions(15 * 60 * 1000),
      ); // 15 minutes
      res.cookie(
        "refreshToken",
        result.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_REGISTERED,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await this.service.login(
        email,
        password,
        this.getClientMetadata(req),
      );

      // Set HTTP-only cookies
      res.cookie(
        "accessToken",
        result.accessToken,
        getCookieOptions(15 * 60 * 1000),
      ); // 15 minutes
      res.cookie(
        "refreshToken",
        result.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }

      // Generate tokens
      const accessToken = JwtUtil.generateAccessToken(user.id, user.email);
      const refreshToken = JwtUtil.generateRefreshToken(user.id, user.email);

      // Store refresh token in database
      await this.service.storeRefreshToken(
        user.id,
        refreshToken,
        this.getClientMetadata(req),
      );

      // Set HTTP-only cookies
      res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      // Encode user data sebagai base64
      const userData = Buffer.from(
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        }),
      ).toString("base64");

      // Redirect dengan user data (tanpa token di URL)
      const frontendUrl = new URL(`${config.FRONTEND_URL}/login`);
      frontendUrl.searchParams.append("user", userData);
      frontendUrl.searchParams.append("oauth", "success");

      return res.redirect(frontendUrl.toString());
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      // Try to get refresh token from cookie first, then fallback to body
      const refreshTokenValue =
        req.cookies?.refreshToken || req.body.refreshToken;

      const result = await this.service.refreshToken(
        refreshTokenValue,
        this.getClientMetadata(req),
      );

      // Set new HTTP-only cookies
      res.cookie(
        "accessToken",
        result.accessToken,
        getCookieOptions(15 * 60 * 1000),
      ); // 15 minutes
      res.cookie(
        "refreshToken",
        result.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies?.refreshToken;

      // Revoke refresh token in database if exists
      if (refreshToken) {
        await this.service.logout(refreshToken);
      }

      // Clear cookies
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const profile = await this.service.getProfile(userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_RETRIEVED,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAllDevices(req, res, next) {
    try {
      const userId = req.user.id;

      await this.service.logoutAllDevices(userId);

      // Clear cookies
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_ALL_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveSessions(req, res, next) {
    try {
      const userId = req.user.id;

      const sessions = await this.service.getActiveSessions(userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.SESSIONS_RETRIEVED,
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
