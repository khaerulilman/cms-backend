import { v4 as uuidv4 } from "uuid";
import RowRepository from "./row.repository.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import ImageCleanupService from "../../utils/imageCleanupService.js";

export class RowService {
  constructor() {
    this.repository = new RowRepository();
  }

  async createRow(tableId, userId) {
    // Check table ownership
    const isTableOwner = await this.repository.checkTableOwnership(
      tableId,
      userId
    );
    if (!isTableOwner) {
      throw new NotFoundError("Table not found");
    }

    const row = await this.repository.createRow({
      id: uuidv4(),
      tableId,
    });

    return this._formatRow(row);
  }

  async getRowsByTable(tableId, userId) {
    // Check table ownership
    const isTableOwner = await this.repository.checkTableOwnership(
      tableId,
      userId
    );
    if (!isTableOwner) {
      throw new NotFoundError("Table not found");
    }

    const rows = await this.repository.findRowsByTableId(tableId);
    return rows.map((row) => this._formatRow(row));
  }

  async getRowById(rowId, userId) {
    // Check row ownership
    const isOwner = await this.repository.checkRowOwnership(rowId, userId);
    if (!isOwner) {
      throw new NotFoundError("Row not found");
    }

    const row = await this.repository.findRowById(rowId);
    if (!row) {
      throw new NotFoundError("Row not found");
    }

    return this._formatRow(row);
  }

  async updateRow(rowId, userId, data) {
    // Check row ownership
    const isOwner = await this.repository.checkRowOwnership(rowId, userId);
    if (!isOwner) {
      throw new NotFoundError("Row not found");
    }

    // For now, we don't allow direct row updates
    // Rows are updated via cell updates
    const row = await this.repository.findRowById(rowId);
    if (!row) {
      throw new NotFoundError("Row not found");
    }

    return this._formatRow(row);
  }

  async deleteRow(rowId, userId) {
    // Check row ownership
    const isOwner = await this.repository.checkRowOwnership(rowId, userId);
    if (!isOwner) {
      throw new NotFoundError("Row not found");
    }

    // Cleanup images from Cloudinary before deleting row
    await ImageCleanupService.deleteImagesByRowId(rowId);

    const row = await this.repository.deleteRow(rowId);

    if (!row) {
      throw new NotFoundError("Row not found");
    }

    return this._formatRow(row);
  }

  _formatRow(row) {
    return {
      id: row.id,
      tableId: row.tableId,
      cells: row.cells
        ? row.cells.map((cell) => ({
            id: cell.id,
            rowId: cell.rowId,
            columnId: cell.columnId,
            columnName: cell.column?.name,
            value: cell.value,
            imageUrl: cell.imageUrl,
            cloudinaryPublicId: cell.cloudinaryPublicId,
            createdAt: cell.createdAt,
            updatedAt: cell.updatedAt,
          }))
        : [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export default RowService;
