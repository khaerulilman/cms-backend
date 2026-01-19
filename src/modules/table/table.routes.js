import { Router } from "express";
import TableController from "./table.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new TableController();

// All routes require authentication
router.use(authMiddleware);

// Create table
router.post("/", (req, res, next) => controller.createTable(req, res, next));

// Get all tables by project
router.get("/project/:projectId", (req, res, next) =>
  controller.getTablesByProject(req, res, next)
);

// Get specific table
router.get("/:tableId", (req, res, next) =>
  controller.getTableById(req, res, next)
);

// Update table
router.put("/:tableId", (req, res, next) =>
  controller.updateTable(req, res, next)
);

// Delete table
router.delete("/:tableId", (req, res, next) =>
  controller.deleteTable(req, res, next)
);

export default router;
