import { SUCCESS_MESSAGES } from '../../constants/http.js';

import ProjectService from './project.service.js';

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
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_CREATED,
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
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_RETRIEVED,
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
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_RETRIEVED,
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
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_UPDATED,
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
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_DELETED,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
