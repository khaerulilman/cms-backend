import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";

import { config } from "./config/env.js";
import passport from "./config/google-oauth.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import routes from "./routes.js";

const app = express();

// Middlewares
app.use(
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
  }),
);

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

export default app;
