import JwtConfig from "../config/jwt.js";

export class JwtUtil {
  static generateAccessToken(userId, email) {
    return JwtConfig.generateToken(
      {
        id: userId,
        email,
        type: "access",
      },
      "7d",
    );
  }

  static generateRefreshToken(userId, email) {
    return JwtConfig.generateToken(
      {
        id: userId,
        email,
        type: "refresh",
      },
      "30d",
    );
  }

  // Short-lived token for establishing session via proxy after OAuth
  static generateSetupToken(userId, email) {
    return JwtConfig.generateToken(
      {
        id: userId,
        email,
        type: "setup",
      },
      "60s",
    );
  }

  static verifyToken(token) {
    return JwtConfig.verifyToken(token);
  }

  static decodeToken(token) {
    return JwtConfig.decodeToken(token);
  }
}

export default JwtUtil;
