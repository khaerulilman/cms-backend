import prisma from "../../prisma/client.js";

export class TableRepository {
  async createTable(data) {
    return prisma.cmsTable.create({
      data,
      include: {
        project: true,
        columns: true,
        rows: true,
      },
    });
  }

  async findTableById(tableId) {
    return prisma.cmsTable.findUnique({
      where: { id: tableId },
      include: {
        project: true,
        columns: true,
        rows: {
          include: {
            cells: true,
          },
        },
      },
    });
  }

  async findTablesByProjectId(projectId) {
    return prisma.cmsTable.findMany({
      where: { projectId },
      include: {
        columns: true,
        rows: {
          take: 5, // Get first 5 rows as preview
        },
      },
    });
  }

  async updateTable(tableId, data) {
    return prisma.cmsTable.update({
      where: { id: tableId },
      data,
      include: {
        project: true,
        columns: true,
        rows: true,
      },
    });
  }

  async deleteTable(tableId) {
    return prisma.cmsTable.delete({
      where: { id: tableId },
    });
  }

  // Find all cells for a specific table (for cleanup purposes)
  async findCellsByTableId(tableId) {
    return prisma.cmsCell.findMany({
      where: {
        row: {
          tableId,
        },
      },
      select: {
        id: true,
        cloudinaryPublicId: true,
        imageUrl: true,
      },
    });
  }

  async checkTableOwnership(tableId, userId) {
    const table = await prisma.cmsTable.findUnique({
      where: { id: tableId },
      include: {
        project: true,
      },
    });

    if (!table) return false;
    return table.project.userId === userId;
  }

  async checkProjectOwnership(projectId, userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return false;
    return project.userId === userId;
  }
}

export default TableRepository;
