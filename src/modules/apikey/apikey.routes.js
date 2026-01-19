import { Router } from "express";
import ApiKeyController from "./apikey.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new ApiKeyController();

// All routes require authentication
router.post("/", authMiddleware, (req, res, next) =>
  controller.generateApiKey(req, res, next)
);

router.get("/", authMiddleware, (req, res, next) =>
  controller.getApiKeys(req, res, next)
);

router.delete("/:apiKeyId", authMiddleware, (req, res, next) =>
  controller.deleteApiKey(req, res, next)
);

export default router;
