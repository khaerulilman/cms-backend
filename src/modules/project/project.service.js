import { v4 as uuidv4 } from "uuid";
import ProjectRepository from "./project.repository.js";
import ImageCleanupService from "../../utils/imageCleanupService.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { Validator } from "../../utils/validator.js";

export class ProjectService {
  constructor() {
    this.repository = new ProjectRepository();
  }

  validateUUID(id, fieldName = "ID") {
    if (!id || !Validator.isValidUUID(id)) {
      throw new NotFoundError(`${fieldName} not found`);
    }
  }

  async createProject(userId, data) {
    // Validate input
    if (!data.name || data.name.trim() === "") {
      throw new ValidationError("Project name is required");
    }

    const project = await this.repository.createProject({
      id: uuidv4(),
      userId,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
    });

    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async getProjectById(projectId, userId) {
    // Validate UUID format
    this.validateUUID(projectId, "Project");

    const project = await this.repository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Check ownership
    if (project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      cmsTables: project.cmsTables || [],
    };
  }

  async getUserProjects(userId) {
    const projects = await this.repository.findProjectsByUserId(userId);

    return projects.map((project) => ({
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }

  async updateProject(projectId, userId, data) {
    // Validate UUID format
    this.validateUUID(projectId, "Project");

    // Validate input before checking ownership
    if (data.name !== undefined && (!data.name || data.name.trim() === "")) {
      throw new ValidationError("Project name cannot be empty");
    }

    if (
      data.description !== undefined &&
      data.description &&
      data.description.length > 500
    ) {
      throw new ValidationError(
        "Project description must not exceed 500 characters",
      );
    }

    // Check ownership
    const isOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId,
    );
    if (!isOwner) {
      throw new NotFoundError("Project not found");
    }

    const updateData = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.description !== undefined)
      updateData.description = data.description
        ? data.description.trim()
        : null;

    const project = await this.repository.updateProject(projectId, updateData);

    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async deleteProject(projectId, userId) {
    // Validate UUID format
    this.validateUUID(projectId, "Project");

    // Check ownership
    const isOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId,
    );
    if (!isOwner) {
      throw new NotFoundError("Project not found");
    }

    // Cleanup all images in this project
    await ImageCleanupService.deleteImagesByProjectId(projectId);

    await this.repository.deleteProject(projectId);

    return { message: "Project deleted successfully" };
  }
}

export default ProjectService;
