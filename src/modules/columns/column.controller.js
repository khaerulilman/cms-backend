import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../constants/http.js';

import ColumnService from './column.service.js';
import columnValidationSchemas from './column.validation.js';

export class ColumnController {
  constructor() {
    this.service = new ColumnService();
  }

  async createColumns(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId, columns } = req.body;

      // Validate input
      const { error, value } = columnValidationSchemas.createColumns.validate(
        { tableId, columns },
        { abortEarly: false },
      );

      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: error.details.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        });
      }

      const createdColumns = await this.service.createColumns(
        value.tableId,
        userId,
        value.columns,
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.COLUMNS_CREATED,
        data: createdColumns,
      });
    } catch (error) {
      next(error);
    }
  }

  async getColumnsByTable(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;

      const columns = await this.service.getColumnsByTable(tableId, userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.COLUMNS_RETRIEVED,
        data: columns,
      });
    } catch (error) {
      next(error);
    }
  }

  async getColumnById(req, res, next) {
    try {
      const userId = req.user.id;
      const { columnId } = req.params;

      const column = await this.service.getColumnById(columnId, userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.COLUMN_RETRIEVED,
        data: column,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateColumn(req, res, next) {
    try {
      const userId = req.user.id;
      const { columnId } = req.params;
      const { name } = req.body;

      // Validate input
      const { error, value } = columnValidationSchemas.updateColumn.validate(
        { name },
        { abortEarly: false },
      );

      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: error.details.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        });
      }

      const updatedColumn = await this.service.updateColumn(
        columnId,
        userId,
        value,
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.COLUMN_UPDATED,
        data: updatedColumn,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteColumn(req, res, next) {
    try {
      const userId = req.user.id;
      const { columnId } = req.params;

      const deletedColumn = await this.service.deleteColumn(columnId, userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.COLUMN_DELETED,
        data: deletedColumn,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ColumnController;
