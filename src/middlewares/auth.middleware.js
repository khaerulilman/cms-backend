import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import JwtUtil from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.NO_TOKEN_PROVIDED,
      });
    }
    const decoded = JwtUtil.verifyToken(token);

    if (!decoded || decoded.type !== 'access') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};
