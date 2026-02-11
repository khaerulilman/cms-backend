import { v4 as uuidv4 } from "uuid";

import { ValidationError, TableNotFoundError } from "../../utils/errors.js";
import ImageCleanupService from "../../utils/imageCleanupService.js";
import logger from "../../utils/logger.js";

import TableRepository from "./table.repository.js";

export class TableService {
  constructor() {
    this.repository = new TableRepository();
  }

  async createTable(projectId, userId, data) {
    logger.debug(
      { projectId, userId, tableName: data.name },
      "Create table service called",
    );
    // Validate input
    if (!data.name || data.name.trim() === "") {
      logger.warn({ projectId, userId }, "Table name is required");
      throw new ValidationError("Table name is required");
    }

    // Check project ownership
    const isProjectOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId,
    );

    if (!isProjectOwner) {
      logger.warn({ projectId, userId }, "Project ownership check failed");
      throw new TableNotFoundError("Project not found");
    }

    const table = await this.repository.createTable({
      id: uuidv4(),
      projectId,
      name: data.name.trim(),
      isSubTable: data.isSubTable ?? false,
    });

    logger.info({ tableId: table.id, projectId }, "Table created in service");

    return this._formatTable(table);
  }

  async getUserTablesByProject(projectId, userId) {
    logger.debug(
      { projectId, userId },
      "Get user tables by project service called",
    );
    // Check project ownership
    const isProjectOwner = await this.repository.checkProjectOwnership(
      projectId,
      userId,
    );

    if (!isProjectOwner) {
      logger.warn({ projectId, userId }, "Project ownership check failed");
      throw new TableNotFoundError("Project not found");
    }

    const tables = await this.repository.findTablesByProjectId(projectId);

    logger.info(
      { projectId, tableCount: tables.length },
      "Tables retrieved from project",
    );
    return tables.map((table) => this._formatTable(table));
  }

  async getTableById(tableId, userId) {
    logger.debug({ tableId, userId }, "Get table by ID service called");
    const table = await this.repository.findTableById(tableId);

    if (!table) {
      logger.warn({ tableId }, "Table not found in database");
      throw new TableNotFoundError("Table not found");
    }

    // Check ownership
    if (table.project.userId !== userId) {
      logger.warn(
        { tableId, userId, ownerId: table.project.userId },
        "Table ownership check failed",
      );
      throw new TableNotFoundError("Table not found");
    }

    logger.info(
      { tableId, userId, tableName: table.name },
      "Table retrieved by ID",
    );
    return this._formatTableWithFullData(table);
  }

  async updateTable(tableId, userId, data) {
    logger.debug(
      { tableId, userId, newName: data.name },
      "Update table service called",
    );
    // Check ownership
    const isOwner = await this.repository.checkTableOwnership(tableId, userId);
    if (!isOwner) {
      logger.warn({ tableId, userId }, "Table ownership check failed");
      throw new TableNotFoundError("Table not found");
    }

    // Validate input
    if (data.name && data.name.trim() === "") {
      logger.warn({ tableId, userId }, "Table name is empty for update");
      throw new ValidationError("Table name cannot be empty");
    }

    const updateData = {};
    if (data.name) updateData.name = data.name.trim();

    const table = await this.repository.updateTable(tableId, updateData);

    logger.info(
      { tableId, userId, newName: table.name },
      "Table updated in service",
    );
    return this._formatTable(table);
  }

  async deleteTable(tableId, userId) {
    logger.debug({ tableId, userId }, "Delete table service called");
    // Check ownership
    const isOwner = await this.repository.checkTableOwnership(tableId, userId);
    if (!isOwner) {
      logger.warn({ tableId, userId }, "Table ownership check failed");
      throw new TableNotFoundError("Table not found");
    }

    // Cleanup images from Cloudinary before deleting table
    logger.debug({ tableId }, "Cleaning up images from table");
    await ImageCleanupService.deleteImagesByTableId(tableId);

    // Delete the table from database
    await this.repository.deleteTable(tableId);

    logger.info({ tableId, userId }, "Table deleted with image cleanup");
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
    logger.debug({ tableId, userId }, "Get table simplified service called");
    const table = await this.repository.findTableById(tableId);

    if (!table) {
      logger.warn({ tableId }, "Table not found in database");
      throw new TableNotFoundError("Table not found");
    }

    // Check ownership
    if (table.project.userId !== userId) {
      logger.warn(
        { tableId, userId, ownerId: table.project.userId },
        "Table ownership check failed",
      );
      throw new TableNotFoundError("Table not found");
    }

    logger.debug({ tableId }, "Resolving table references");
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
      logger.debug(
        { tableId: value },
        "Circular reference detected, returning original value",
      );
      return value;
    }

    try {
      logger.debug({ tableId: value }, "Attempting to resolve table reference");
      // Try to get the referenced table
      const referencedTable = await this.repository.findTableById(value);

      if (!referencedTable) {
        logger.debug(
          { tableId: value },
          "Referenced table not found, returning original value",
        );
        return value;
      }

      // Check ownership
      if (referencedTable.project.userId !== userId) {
        logger.warn(
          { tableId: value, userId },
          "User does not own referenced table, returning original value",
        );
        return value;
      }

      // Add to visited set before resolving
      visitedTableIds.add(value);

      logger.debug({ tableId: value }, "Resolving nested table reference");
      // Return simplified format of referenced table with nested resolution
      return this._formatTableSimplifiedWithResolution(
        referencedTable,
        userId,
        visitedTableIds,
      );
    } catch (error) {
      logger.error(
        { tableId: value, error: error.message },
        "Error resolving table reference",
      );
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
          rowData[key] = cell.imageUrl || cell.value;
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
    visitedTableIds = new Set(),
  ) {
    logger.debug(
      { tableId: table.id, rowCount: table.rows.length },
      "Formatting table with reference resolution",
    );
    const normalizeKey = (name) =>
      name.trim().toLowerCase().replace(/\s+/g, "_"); // spasi jadi underscore

    const cellsByRow = await Promise.all(
      table.rows.map(async (row) => {
        const rowData = {};

        await Promise.all(
          row.cells.map(async (cell) => {
            const column = table.columns.find(
              (col) => col.id === cell.columnId,
            );
            if (column) {
              const key = normalizeKey(column.name);
              const cellValue = cell.imageUrl || cell.value;
              // Resolve table references recursively with visited tracking
              rowData[key] = await this._resolveTableReference(
                cellValue,
                userId,
                visitedTableIds,
              );
            }
          }),
        );

        return rowData;
      }),
    );

    logger.info(
      {
        tableId: table.id,
        rowCount: cellsByRow.length,
        columnCount: table.columns.length,
      },
      "Table formatted successfully",
    );
    return {
      name: table.name,
      cells: cellsByRow,
    };
  }
}

export default TableService;
