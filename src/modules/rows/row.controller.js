import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../constants/http.js';

import RowService from './row.service.js';

export class RowController {
  constructor() {
    this.service = new RowService();
  }

  async createRow(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.body;

      if (!tableId) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.TABLE_ID_REQUIRED,
        });
      }

      const row = await this.service.createRow(tableId, userId);

      return res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.ROW_CREATED,
        data: row,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRowsByTable(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;

      const rows = await this.service.getRowsByTable(tableId, userId);

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.ROWS_RETRIEVED,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRowById(req, res, next) {
    try {
      const userId = req.user.id;
      const { rowId } = req.params;

      const row = await this.service.getRowById(rowId, userId);

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.ROW_RETRIEVED,
        data: row,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRow(req, res, next) {
    try {
      const userId = req.user.id;
      const { rowId } = req.params;
      const data = req.body;

      const updatedRow = await this.service.updateRow(rowId, userId, data);

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.ROW_UPDATED,
        data: updatedRow,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRow(req, res, next) {
    try {
      const userId = req.user.id;
      const { rowId } = req.params;

      const deletedRow = await this.service.deleteRow(rowId, userId);

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.ROW_DELETED,
        data: deletedRow,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RowController;
