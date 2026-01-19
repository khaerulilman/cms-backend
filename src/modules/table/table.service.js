import { v4 as uuidv4 } from "uuid";
import TableRepository from "./table.repository.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import ImageCleanupService from "../../utils/imageCleanupService.js";

export class TableService {
  constructor() {
    this.repository = new TableRepository();
  }

  async createTable(projectId, userId, data) {
    // Validate input
    if (!data.name || data.name.trim() === "") {
      throw new ValidationError("Table name is required");
    }

    // Check project ownership
    const isProjectOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId
    );

    if (!isProjectOwner) {
      throw new NotFoundError("Project not found");
    }

    const table = await this.repository.createTable({
      id: uuidv4(),
      projectId,
      name: data.name.trim(),
      isSubTable: data.isSubTable ?? false,
    });

    return this._formatTable(table);
  }

  async getUserTablesByProject(projectId, userId) {
    // Check project ownership
    const isProjectOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId
    );

    if (!isProjectOwner) {
      throw new NotFoundError("Project not found");
    }

    const tables = await this.repository.findTablesByProjectId(projectId);

    return tables.map((table) => this._formatTable(table));
  }

  async getTableById(tableId, userId) {
    const table = await this.repository.findTableById(tableId);

    if (!table) {
      throw new NotFoundError("Table not found");
    }

    // Check ownership
    if (table.project.userId !== userId) {
      throw new NotFoundError("Table not found");
    }

    return this._formatTableWithFullData(table);
  }

  async updateTable(tableId, userId, data) {
    // Check ownership
    const isOwner = await this.repository.checkTableOwnership(tableId, userId);
    if (!isOwner) {
      throw new NotFoundError("Table not found");
    }

    // Validate input
    if (data.name && data.name.trim() === "") {
      throw new ValidationError("Table name cannot be empty");
    }

    const updateData = {};
    if (data.name) updateData.name = data.name.trim();

    const table = await this.repository.updateTable(tableId, updateData);

    return this._formatTable(table);
  }

  async deleteTable(tableId, userId) {
    // Check ownership
    const isOwner = await this.repository.checkTableOwnership(tableId, userId);
    if (!isOwner) {
      throw new NotFoundError("Table not found");
    }

    // Cleanup images from Cloudinary before deleting table
    await ImageCleanupService.deleteImagesByTableId(tableId);

    // Delete the table from database
    await this.repository.deleteTable(tableId);
  }

  _formatTable(table) {
    return {
      id: table.id,
      projectId: table.projectId,
      name: table.name,
      isSubTable: table.isSubTable,
      columnCount: table.columns ? table.columns.length : 0,
      rowCount: table.rows ? table.rows.length : 0,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }

  _formatTableWithFullData(table) {
    return {
      id: table.id,
      projectId: table.projectId,
      name: table.name,
      isSubTable: table.isSubTable,
      columns: table.columns.map((col) => ({
        id: col.id,
        name: col.name,
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
      })),
      rows: table.rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        cells: row.cells.map((cell) => ({
          id: cell.id,
          columnId: cell.columnId,
          value: cell.value,
          createdAt: cell.createdAt,
          updatedAt: cell.updatedAt,
        })),
      })),
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }

  async getTableSimplified(tableId, userId) {
    const table = await this.repository.findTableById(tableId);

    if (!table) {
      throw new NotFoundError("Table not found");
    }

    // Check ownership
    if (table.project.userId !== userId) {
      throw new NotFoundError("Table not found");
    }

    // Pass empty Set for tracking visited tables (prevent infinite loops)
    return this._formatTableSimplifiedWithResolution(table, userId, new Set());
  }

  _isValidUUID(value) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof value === "string" && uuidRegex.test(value);
  }

  async _resolveTableReference(value, userId, visitedTableIds = new Set()) {
    // Check if value is a valid UUID (tableId)
    if (!this._isValidUUID(value)) {
      return value;
    }

    // Prevent infinite loops with circular references
    if (visitedTableIds.has(value)) {
      return value;
    }

    try {
      // Try to get the referenced table
      const referencedTable = await this.repository.findTableById(value);

      if (!referencedTable) {
        return value;
      }

      // Check ownership
      if (referencedTable.project.userId !== userId) {
        return value;
      }

      // Add to visited set before resolving
      visitedTableIds.add(value);

      // Return simplified format of referenced table with nested resolution
      return this._formatTableSimplifiedWithResolution(
        referencedTable,
        userId,
        visitedTableIds
      );
    } catch (error) {
      // If error, return original value
      return value;
    }
  }

  _formatTableSimplified(table) {
    const normalizeKey = (name) =>
      name.trim().toLowerCase().replace(/\s+/g, "_"); // spasi jadi underscore

    const cellsByRow = table.rows.map((row) => {
      const rowData = {};

      row.cells.forEach((cell) => {
        const column = table.columns.find((col) => col.id === cell.columnId);
        if (column) {
          const key = normalizeKey(column.name);
          rowData[key] = cell.value;
        }
      });

      return rowData;
    });

    return {
      name: table.name,
      cells: cellsByRow,
    };
  }

  async _formatTableSimplifiedWithResolution(
    table,
    userId,
    visitedTableIds = new Set()
  ) {
    const normalizeKey = (name) =>
      name.trim().toLowerCase().replace(/\s+/g, "_"); // spasi jadi underscore

    const cellsByRow = await Promise.all(
      table.rows.map(async (row) => {
        const rowData = {};

        await Promise.all(
          row.cells.map(async (cell) => {
            const column = table.columns.find(
              (col) => col.id === cell.columnId
            );
            if (column) {
              const key = normalizeKey(column.name);
              // Resolve table references recursively with visited tracking
              rowData[key] = await this._resolveTableReference(
                cell.value,
                userId,
                visitedTableIds
              );
            }
          })
        );

        return rowData;
      })
    );

    return {
      name: table.name,
      cells: cellsByRow,
    };
  }
}

export default TableService;
