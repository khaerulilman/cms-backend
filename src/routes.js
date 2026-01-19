import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import tableRoutes from "./modules/table/table.routes.js";
import columnRoutes from "./modules/columns/column.routes.js";
import rowRoutes from "./modules/rows/row.routes.js";
import cellRoutes from "./modules/cells/cell.routes.js";
import apiKeyRoutes from "./modules/apikey/apikey.routes.js";
import { apiKeyMiddleware } from "./middlewares/apiKey.middleware.js";
import TableController from "./modules/table/table.controller.js";

const router = Router();
const tableController = new TableController();

// Auth routes
router.use("/api/v1/auth", authRoutes);

// API Key routes
router.use("/api/v1/api-keys", apiKeyRoutes);

// Project routes
router.use("/api/v1/projects", projectRoutes);

// table routes
router.use("/api/v1/cms-tables", tableRoutes);

// column routes
router.use("/api/v1/cms-columns", columnRoutes);

// row routes
router.use("/api/v1/cms-rows", rowRoutes);

// cell routes
router.use("/api/v1/cms-cells", cellRoutes);

// API Key protected routes
// Get table by ID with API Key
router.get(
  "/api/v1/project/:projectId/table/:tableId",
  apiKeyMiddleware,
  (req, res, next) => tableController.getTableById(req, res, next)
);

// Get simplified table by ID with API Key
router.get(
  "/api/v1/project/:projectId/table/:tableId/simplify",
  apiKeyMiddleware,
  (req, res, next) => tableController.getTableSimplified(req, res, next)
);

export default router;
