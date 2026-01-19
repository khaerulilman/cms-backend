import { Router } from "express";
import RowController from "./row.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new RowController();

// All routes require authentication
router.use(authMiddleware);

// Create row
router.post("/", (req, res, next) => controller.createRow(req, res, next));

// Get all rows by table
router.get("/table/:tableId", (req, res, next) =>
  controller.getRowsByTable(req, res, next)
);

// Get specific row
router.get("/:rowId", (req, res, next) =>
  controller.getRowById(req, res, next)
);

// Update row
router.put("/:rowId", (req, res, next) =>
  controller.updateRow(req, res, next)
);

// Delete row
router.delete("/:rowId", (req, res, next) =>
  controller.deleteRow(req, res, next)
);

export default router;
