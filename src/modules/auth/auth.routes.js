import { Router } from 'express';

import passport from '../../config/google-oauth.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { sanitizeInput } from '../../middlewares/sanitize.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';

import AuthController from './auth.controller.js';
import { authValidationSchemas } from './auth.validation.js';

const router = Router();
const controller = new AuthController();

// Public routes
router.post(
  '/register',
  sanitizeInput,
  validateRequest(authValidationSchemas.register),
  (req, res, next) => controller.register(req, res, next),
);
router.post(
  '/login',
  sanitizeInput,
  validateRequest(authValidationSchemas.login),
  (req, res, next) => controller.login(req, res, next),
);
router.post(
  '/refresh-token',
  sanitizeInput,
  validateRequest(authValidationSchemas.refreshToken),
  (req, res, next) => controller.refreshToken(req, res, next),
);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login',
  }),
  (req, res, next) => controller.googleCallback(req, res, next),
);

// Protected routes
router.get('/profile', authMiddleware, (req, res, next) =>
  controller.getProfile(req, res, next),
);

export default router;
