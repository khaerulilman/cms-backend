import prisma from "../../prisma/client.js";

export class ProjectRepository {
  async createProject(data) {
    return prisma.project.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findProjectById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        cmsTables: true,
      },
    });
  }

  async findProjectsByUserId(userId) {
    return prisma.project.findMany({
      where: { userId },
      include: {
        user: true,
        cmsTables: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateProject(id, data) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async deleteProject(id) {
    return prisma.project.delete({
      where: { id },
    });
  }

  async checkProjectOwnership(projectId, userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });
    return project && project.userId === userId;
  }
}

export default ProjectRepository;
