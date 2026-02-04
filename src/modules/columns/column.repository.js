import prisma from '../../prisma/client.js';

export class ColumnRepository {
  async createColumns(data) {
    // Create multiple columns at once
    const columns = await Promise.all(
      data.map((column) =>
        prisma.cmsColumn.create({
          data: {
            ...column,
          },
          include: {
            table: true,
          },
        }),
      ),
    );
    return columns;
  }

  async findColumnById(columnId) {
    return prisma.cmsColumn.findUnique({
      where: { id: columnId },
      include: {
        table: true,
        cells: true,
      },
    });
  }

  async findColumnsByTableId(tableId) {
    return prisma.cmsColumn.findMany({
      where: { tableId },
      include: {
        table: true,
        cells: {
          take: 5, // Get first 5 cells as preview
        },
      },
    });
  }

  async updateColumn(columnId, data) {
    return prisma.cmsColumn.update({
      where: { id: columnId },
      data,
      include: {
        table: true,
        cells: true,
      },
    });
  }

  async deleteColumn(columnId) {
    return prisma.cmsColumn.delete({
      where: { id: columnId },
    });
  }

  async checkColumnOwnership(columnId, userId) {
    const column = await prisma.cmsColumn.findUnique({
      where: { id: columnId },
      include: {
        table: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!column) return false;
    return column.table.project.userId === userId;
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
}

export default ColumnRepository;
