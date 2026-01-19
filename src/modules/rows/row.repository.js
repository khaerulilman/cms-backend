import prisma from "../../prisma/client.js";

export class RowRepository {
  async createRow(data) {
    return prisma.cmsRow.create({
      data,
      include: {
        table: true,
        cells: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async findRowById(rowId) {
    return prisma.cmsRow.findUnique({
      where: { id: rowId },
      include: {
        table: true,
        cells: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async findRowsByTableId(tableId) {
    return prisma.cmsRow.findMany({
      where: { tableId },
      include: {
        table: true,
        cells: {
          include: {
            column: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateRow(rowId, data) {
    return prisma.cmsRow.update({
      where: { id: rowId },
      data,
      include: {
        table: true,
        cells: {
          include: {
            column: true,
          },
        },
      },
    });
  }

  async deleteRow(rowId) {
    return prisma.cmsRow.delete({
      where: { id: rowId },
    });
  }

  // Find all cells for a specific row (for cleanup purposes)
  async findCellsByRowId(rowId) {
    return prisma.cmsCell.findMany({
      where: { rowId },
      select: {
        id: true,
        cloudinaryPublicId: true,
        imageUrl: true,
      },
    });
  }

  async checkRowOwnership(rowId, userId) {
    const row = await prisma.cmsRow.findUnique({
      where: { id: rowId },
      include: {
        table: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!row) return false;
    return row.table.project.userId === userId;
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

export default RowRepository;
