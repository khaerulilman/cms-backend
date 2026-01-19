import ApiKeyService from "./apikey.service.js";

export class ApiKeyController {
  constructor() {
    this.service = new ApiKeyService();
  }

  async generateApiKey(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.service.generateApiKey(userId);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          id: result.id,
          apiKey: result.apiKey,
          createdAt: result.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApiKeys(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.service.getApiKeys(userId);

      return res.status(200).json({
        success: true,
        message: "API keys retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteApiKey(req, res, next) {
    try {
      const userId = req.user.id;
      const { apiKeyId } = req.params;

      const result = await this.service.deleteApiKey(userId, apiKeyId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          deletedId: result.deletedId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ApiKeyController;
