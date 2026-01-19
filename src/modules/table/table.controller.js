import TableService from "./table.service.js";

export class TableController {
  constructor() {
    this.service = new TableService();
  }

  async createTable(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectId, name, isSubTable } = req.body;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
      }

      const table = await this.service.createTable(projectId, userId, {
        name,
        isSubTable,
      });

      return res.status(201).json({
        success: true,
        message: "Table created successfully",
        data: table,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTablesByProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;

      const tables = await this.service.getUserTablesByProject(
        projectId,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Tables retrieved successfully",
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTableById(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;

      const table = await this.service.getTableById(tableId, userId);

      return res.status(200).json({
        success: true,
        message: "Table retrieved successfully",
        data: table,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTable(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;
      const { name } = req.body;

      const table = await this.service.updateTable(tableId, userId, { name });

      return res.status(200).json({
        success: true,
        message: "Table updated successfully",
        data: table,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTable(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;

      await this.service.deleteTable(tableId, userId);

      return res.status(200).json({
        success: true,
        message: "Table deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTableSimplified(req, res, next) {
    try {
      const userId = req.user.id;
      const { tableId } = req.params;

      const table = await this.service.getTableSimplified(tableId, userId);

      return res.status(200).json({
        success: true,
        message: "Table retrieved successfully",
        data: table,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TableController;
