import ProjectService from "./project.service.js";

export class ProjectController {
  constructor() {
    this.service = new ProjectService();
  }

  async createProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, description } = req.body;

      const project = await this.service.createProject(userId, {
        name,
        description,
      });

      return res.status(201).json({
        status: "success",
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;

      const project = await this.service.getProjectById(projectId, userId);

      return res.status(200).json({
        status: "success",
        message: "Project retrieved successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProjects(req, res, next) {
    try {
      const userId = req.user.id;

      const projects = await this.service.getUserProjects(userId);

      return res.status(200).json({
        status: "success",
        message: "Projects retrieved successfully",
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;
      const { name, description } = req.body;

      const project = await this.service.updateProject(projectId, userId, {
        name,
        description,
      });

      return res.status(200).json({
        status: "success",
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;

      await this.service.deleteProject(projectId, userId);

      return res.status(200).json({
        status: "success",
        message: "Project deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
