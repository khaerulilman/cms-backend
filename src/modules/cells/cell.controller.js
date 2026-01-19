import CellService from "./cell.service.js";
import FileUtils from "../../utils/file.js";

export class CellController {
  constructor() {
    this.service = new CellService();
  }

  async getCellsByRow(req, res, next) {
    try {
      const userId = req.user.id;
      const { rowId } = req.params;

      const cells = await this.service.getCellsByRow(rowId, userId);

      return res.status(200).json({
        success: true,
        message: "Cells retrieved successfully",
        data: cells,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCellById(req, res, next) {
    try {
      const userId = req.user.id;
      const { cellId } = req.params;

      const cell = await this.service.getCellById(cellId, userId);

      return res.status(200).json({
        success: true,
        message: "Cell retrieved successfully",
        data: cell,
      });
    } catch (error) {
      next(error);
    }
  }

  async upsertCell(req, res, next) {
    try {
      const userId = req.user.id;
      const { rowId } = req.params;
      const { columnId, value } = req.body;
      const imageFile = req.file;

      if (!columnId) {
        // Clean up uploaded file if validation fails
        if (imageFile) {
          await FileUtils.deleteFile(imageFile.path);
        }
        return res.status(400).json({
          success: false,
          message: "Column ID is required",
        });
      }

      try {
        const cell = await this.service.upsertCell(
          rowId,
          columnId,
          userId,
          value,
          imageFile
        );

        // Clean up temporary file after successful upload to Cloudinary
        if (imageFile) {
          await FileUtils.deleteFile(imageFile.path);
        }

        return res.status(200).json({
          success: true,
          message: "Cell upserted successfully",
          data: cell,
        });
      } catch (error) {
        // Clean up file in case of error
        if (imageFile) {
          await FileUtils.deleteFile(imageFile.path);
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteCell(req, res, next) {
    try {
      const userId = req.user.id;
      const { cellId } = req.params;

      const cell = await this.service.deleteCell(cellId, userId);

      return res.status(200).json({
        success: true,
        message: "Cell deleted successfully",
        data: cell,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CellController;
