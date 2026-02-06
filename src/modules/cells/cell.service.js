import CloudinaryService from "../../utils/cloudinary.js";
import { NotFoundError } from "../../utils/errors.js";

import CellRepository from "./cell.repository.js";

export class CellService {
  constructor() {
    this.repository = new CellRepository();
  }

  async getCellsByRow(rowId, userId) {
    // Check row ownership
    const isRowOwner = await this.repository.checkRowOwnership(rowId, userId);
    if (!isRowOwner) {
      throw new NotFoundError("Row not found");
    }

    const cells = await this.repository.findCellsByRowId(rowId);
    return cells.map((cell) => this._formatCell(cell));
  }

  // Upsert cell (update if exists, create if not)
  async upsertCell(rowId, columnId, userId, value, imageFile = null) {
    // Check row ownership
    const isRowOwner = await this.repository.checkRowOwnership(rowId, userId);
    if (!isRowOwner) {
      throw new NotFoundError("Row not found");
    }

    // Check if cell already exists
    const existingCell = await this.repository.findCellByRowAndColumn(
      rowId,
      columnId,
    );

    let finalValue = null;
    let imageUrl = null;
    let cloudinaryPublicId = null;

    // Case 1: User mengupload image
    if (imageFile) {
      try {
        // Delete existing image if any
        if (existingCell && existingCell.cloudinaryPublicId) {
          await CloudinaryService.deleteImage(existingCell.cloudinaryPublicId);
        }

        // Upload new image to Cloudinary
        const uploadResult = await CloudinaryService.uploadImage(
          imageFile.path,
        );
        imageUrl = uploadResult.imageUrl;
        cloudinaryPublicId = uploadResult.publicId;

        // Set value to null (mutually exclusive)
        finalValue = null;
      } catch (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }
    // Case 2: User mengisi value (text)
    else if (value && value.trim()) {
      finalValue = value.trim();

      // Delete existing image if user is setting text value
      if (existingCell && existingCell.cloudinaryPublicId) {
        try {
          await CloudinaryService.deleteImage(existingCell.cloudinaryPublicId);
        } catch (error) {
          console.error(
            `Failed to delete image from Cloudinary: ${error.message}`,
          );
        }
      }

      // Clear image fields
      imageUrl = null;
      cloudinaryPublicId = null;
    }
    // Case 3: User tidak mengisi apapun atau value kosong dan tidak ada image
    else {
      finalValue = null;

      // Delete existing image if user clears the cell
      if (existingCell && existingCell.cloudinaryPublicId) {
        try {
          await CloudinaryService.deleteImage(existingCell.cloudinaryPublicId);
        } catch (error) {
          console.error(
            `Failed to delete image from Cloudinary: ${error.message}`,
          );
        }
      }

      imageUrl = null;
      cloudinaryPublicId = null;
    }

    const cell = await this.repository.upsertCell(
      rowId,
      columnId,
      finalValue,
      imageUrl,
      cloudinaryPublicId,
    );

    if (!cell) {
      throw new NotFoundError("Cell not found");
    }

    return this._formatCell(cell);
  }

  _formatCell(cell) {
    return {
      id: cell.id,
      rowId: cell.rowId,
      columnId: cell.columnId,
      columnName: cell.column?.name,
      value: cell.value,
      imageUrl: cell.imageUrl,
      cloudinaryPublicId: cell.cloudinaryPublicId,
      createdAt: cell.createdAt,
      updatedAt: cell.updatedAt,
    };
  }
}

export default CellService;
