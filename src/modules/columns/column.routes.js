import { Router } from "express";
import ColumnController from "./column.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new ColumnController();

// All routes require authentication
router.use(authMiddleware);

// Create columns
router.post("/", (req, res, next) => controller.createColumns(req, res, next));

// Get all columns by table
router.get("/table/:tableId", (req, res, next) =>
  controller.getColumnsByTable(req, res, next)
);

// Get specific column
router.get("/:columnId", (req, res, next) =>
  controller.getColumnById(req, res, next)
);

// Update column
router.put("/:columnId", (req, res, next) =>
  controller.updateColumn(req, res, next)
);

// Delete column
router.delete("/:columnId", (req, res, next) =>
  controller.deleteColumn(req, res, next)
);

export default router;
