import { Router } from "express";
import ProjectController from "./project.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new ProjectController();

// All routes require authentication
router.use(authMiddleware);

// Create project
router.post("/", (req, res, next) => controller.createProject(req, res, next));

// Get all user projects
router.get("/", (req, res, next) => controller.getUserProjects(req, res, next));

// Get specific project
router.get("/:projectId", (req, res, next) =>
  controller.getProject(req, res, next)
);

// Update project
router.put("/:projectId", (req, res, next) =>
  controller.updateProject(req, res, next)
);

// Delete project
router.delete("/:projectId", (req, res, next) =>
  controller.deleteProject(req, res, next)
);

export default router;
