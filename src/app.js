import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";

import { config } from "./config/env.js";
import passport from "./config/google-oauth.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import routes from "./routes.js";
import logger from "./utils/logger.js";

const app = express();

// Dynamic CORS middleware
app.use((req, res, next) => {
  // Allow all origins for public simplify endpoint
  if (req.path.includes("/simplify")) {
    cors({
      origin: "*",
      credentials: false,
      methods: ["GET", "OPTIONS"],
      allowedHeaders: ["x-api-key", "Content-Type"],
    })(req, res, next);
  } else {
    // Standard CORS for other routes
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (config.ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })(req, res, next);
  }
});

// Request logging
app.use(requestLogger);

// make express can read json
app.use(express.json());

// make express can read urlencoded
app.use(express.urlencoded({ extended: true }));

// Cookie middleware
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: config.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }, // Set secure: true in production with HTTPS
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorMiddleware);

logger.info({ env: config.NODE_ENV }, "App initialized");

export default app;
