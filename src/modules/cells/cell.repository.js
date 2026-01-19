import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export class CellRepository {
  // Check if user owns the row (indirectly through project -> table -> row)
  async checkRowOwnership(rowId, userId) {
    const row = await prisma.cmsRow.findUnique({
      where: { id: rowId },
      select: {
        table: {
          select: {
            project: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!row) {
      return false;
    }

    return row.table.project.userId === userId;
  }

  // Check if user owns the cell (indirectly through row -> table -> project)
  async checkCellOwnership(cellId, userId) {
    const cell = await prisma.cmsCell.findUnique({
      where: { id: cellId },
      select: {
        row: {
          select: {
            table: {
              select: {
                project: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cell) {
      return false;
    }

    return cell.row.table.project.userId === userId;
  }

  // Find cell by row and column
  async findCellByRowAndColumn(rowId, columnId) {
    const cell = await prisma.cmsCell.findUnique({
      where: {
        rowId_columnId: {
          rowId,
          columnId,
        },
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return cell;
  }

  // Create multiple cells at once
  async createBulkCells(cellsData) {
    const createdCells = await Promise.all(
      cellsData.map((cell) =>
        prisma.cmsCell.create({
          data: {
            id: cell.id,
            rowId: cell.rowId,
            columnId: cell.columnId,
            value: cell.value,
          },
          include: {
            column: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      )
    );

    return createdCells;
  }

  // Find all cells for a specific row
  async findCellsByRowId(rowId) {
    const cells = await prisma.cmsCell.findMany({
      where: { rowId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return cells;
  }

  // Find a specific cell by ID
  async findCellById(cellId) {
    const cell = await prisma.cmsCell.findUnique({
      where: { id: cellId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
        row: true,
      },
    });

    return cell;
  }

  // Upsert cell (update if exists, create if not)
  async upsertCell(
    rowId,
    columnId,
    value,
    imageUrl = null,
    cloudinaryPublicId = null
  ) {
    const cell = await prisma.cmsCell.upsert({
      where: {
        rowId_columnId: {
          rowId,
          columnId,
        },
      },
      update: {
        value,
        imageUrl,
        cloudinaryPublicId,
      },
      create: {
        id: crypto.randomUUID(),
        rowId,
        columnId,
        value,
        imageUrl,
        cloudinaryPublicId,
      },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return cell;
  }

  // Delete a cell
  async deleteCell(cellId) {
    const deletedCell = await prisma.cmsCell.delete({
      where: { id: cellId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return deletedCell;
  }
}

export default CellRepository;
