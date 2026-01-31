import ColumnService from "./column.service.js";

export class ColumnController {
  constructor() {
    this.service = new ColumnService();
  }

  async createColumns(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId, columns } = req.body;

      if (!tableId) {
        return res.status(400).json({
          status: "fail",
          message: "Table ID is required",
        });
      }

      const createdColumns = await this.service.createColumns(
        tableId,
        userId,
        columns,
      );

      return res.status(201).json({
        status: "success",
        message: "Columns created successfully",
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

      return res.status(200).json({
        status: "success",
        message: "Columns retrieved successfully",
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

      return res.status(200).json({
        status: "success",
        message: "Column retrieved successfully",
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

      if (!name) {
        return res.status(400).json({
          status: "fail",
          message: "Column name is required",
        });
      }

      const updatedColumn = await this.service.updateColumn(columnId, userId, {
        name,
      });

      return res.status(200).json({
        status: "success",
        message: "Column updated successfully",
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

      return res.status(200).json({
        status: "success",
        message: "Column deleted successfully",
        data: deletedColumn,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ColumnController;
