import prisma from '../../prisma/client.js';
import logger from '../../utils/logger.js';

export class TableRepository {
  async createTable(data) {
    logger.debug(
      { projectId: data.projectId, tableName: data.name },
      'Creating table in database',
    );
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
    logger.debug({ tableId }, 'Finding table by ID in database');
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
    logger.debug({ projectId }, 'Finding tables by project ID in database');
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
    logger.debug({ tableId, updatingData: data }, 'Updating table in database');
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
    logger.debug({ tableId }, 'Deleting table from database');
    return prisma.cmsTable.delete({
      where: { id: tableId },
    });
  }

  // Find all cells for a specific table (for cleanup purposes)
  async findCellsByTableId(tableId) {
    logger.debug({ tableId }, 'Finding cells by table ID in database');
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
    logger.debug({ tableId, userId }, 'Checking table ownership');
    const table = await prisma.cmsTable.findUnique({
      where: { id: tableId },
      include: {
        project: true,
      },
    });

    if (!table) {
      logger.warn({ tableId }, 'Table not found for ownership check');
      return false;
    }

    const isOwner = table.project.userId === userId;
    if (!isOwner) {
      logger.warn(
        { tableId, userId, ownerId: table.project.userId },
        'User does not own table',
      );
    }

    return isOwner;
  }

  async checkProjectOwnership(projectId, userId) {
    logger.debug({ projectId, userId }, 'Checking project ownership');
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      logger.warn({ projectId }, 'Project not found for ownership check');
      return false;
    }

    const isOwner = project.userId === userId;
    if (!isOwner) {
      logger.warn(
        { projectId, userId, ownerId: project.userId },
        'User does not own project',
      );
    }

    return isOwner;
  }
}

export default TableRepository;
