import { v4 as uuidv4 } from "uuid";
import ColumnRepository from "./column.repository.js";
import ImageCleanupService from "../../utils/imageCleanupService.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/http.js";

export class ColumnService {
  constructor() {
    this.repository = new ColumnRepository();
  }

  async createColumns(tableId, userId, columns) {
    // Validate tableId
    if (!tableId || tableId.trim() === "") {
      throw new ValidationError(ERROR_MESSAGES.TABLE_ID_REQUIRED);
    }

    // Validate input
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.COLUMNS_EMPTY);
    }

    // Check if all columns have names
    for (let column of columns) {
      if (!column.name || column.name.trim() === "") {
        throw new ValidationError(ERROR_MESSAGES.COLUMN_NAME_REQUIRED);
      }
    }

    // Check table ownership
    const isTableOwner = await this.repository.checkTableOwnership(
      tableId,
      userId,
    );
    if (!isTableOwner) {
      throw new NotFoundError(ERROR_MESSAGES.TABLE_NOT_FOUND);
    }

    // Prepare columns data
    const columnsData = columns.map((column) => ({
      id: uuidv4(),
      tableId,
      name: column.name.trim(),
    }));

    const createdColumns = await this.repository.createColumns(columnsData);

    return createdColumns.map((col) => this._formatColumn(col));
  }

  async getColumnsByTable(tableId, userId) {
    // Check table ownership
    const isTableOwner = await this.repository.checkTableOwnership(
      tableId,
      userId,
    );
    if (!isTableOwner) {
      throw new NotFoundError(ERROR_MESSAGES.TABLE_NOT_FOUND);
    }

    const columns = await this.repository.findColumnsByTableId(tableId);
    return columns.map((col) => this._formatColumn(col));
  }

  async getColumnById(columnId, userId) {
    // Check column ownership
    const isOwner = await this.repository.checkColumnOwnership(
      columnId,
      userId,
    );
    if (!isOwner) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    const column = await this.repository.findColumnById(columnId);
    if (!column) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    return this._formatColumn(column);
  }

  async updateColumn(columnId, userId, data) {
    // Validate input
    if (!data.name || data.name.trim() === "") {
      throw new ValidationError(ERROR_MESSAGES.COLUMN_NAME_REQUIRED);
    }

    // Check column ownership
    const isOwner = await this.repository.checkColumnOwnership(
      columnId,
      userId,
    );
    if (!isOwner) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    const column = await this.repository.updateColumn(columnId, {
      name: data.name.trim(),
    });

    if (!column) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    return this._formatColumn(column);
  }

  async deleteColumn(columnId, userId) {
    // Check column ownership
    const isOwner = await this.repository.checkColumnOwnership(
      columnId,
      userId,
    );
    if (!isOwner) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    // Cleanup images from all cells in this column
    await ImageCleanupService.deleteImagesByColumnId(columnId);

    const column = await this.repository.deleteColumn(columnId);

    if (!column) {
      throw new NotFoundError(ERROR_MESSAGES.COLUMN_NOT_FOUND);
    }

    return this._formatColumn(column);
  }

  _formatColumn(column) {
    return {
      id: column.id,
      tableId: column.tableId,
      name: column.name,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    };
  }
}

export default ColumnService;
