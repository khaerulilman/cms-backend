import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiKeyController } from "../apikey.controller.js";

describe("ApiKeyController", () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      generateApiKey: vi.fn(),
      getApiKeys: vi.fn(),
      deleteApiKey: vi.fn(),
    };

    controller = new ApiKeyController();
    controller.service = mockService;

    mockReq = {
      user: { id: "user-123" },
      params: {},
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("generateApiKey", () => {
    it("should return 201 with generated API key", async () => {
      const mockResult = {
        id: "key-1",
        apiKey: "sk_test123",
        createdAt: new Date(),
        message: "API key generated successfully",
      };

      mockService.generateApiKey.mockResolvedValue(mockResult);

      await controller.generateApiKey(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message,
        data: {
          id: mockResult.id,
          apiKey: mockResult.apiKey,
          createdAt: mockResult.createdAt,
        },
      });
      expect(mockService.generateApiKey).toHaveBeenCalledWith("user-123");
    });

    it("should call next with error if service throws", async () => {
      const error = new Error("Service error");
      mockService.generateApiKey.mockRejectedValue(error);

      await controller.generateApiKey(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("getApiKeys", () => {
    it("should return 200 with list of API keys", async () => {
      const mockResult = {
        userId: "user-123",
        apiKeys: [
          {
            id: "key-1",
            apiKey: "sk_a****f",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      mockService.getApiKeys.mockResolvedValue(mockResult);

      await controller.getApiKeys(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "API keys retrieved successfully",
        data: mockResult,
      });
      expect(mockService.getApiKeys).toHaveBeenCalledWith("user-123");
    });

    it("should call next with error if service throws", async () => {
      const error = new Error("Service error");
      mockService.getApiKeys.mockRejectedValue(error);

      await controller.getApiKeys(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteApiKey", () => {
    it("should return 200 when API key is deleted", async () => {
      const apiKeyId = "key-1";
      mockReq.params = { apiKeyId };

      const mockResult = {
        message: "API key deleted successfully",
      };

      mockService.deleteApiKey.mockResolvedValue(mockResult);

      await controller.deleteApiKey(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message,
        data: {
          deletedId: undefined,
        },
      });
      expect(mockService.deleteApiKey).toHaveBeenCalledWith(
        "user-123",
        apiKeyId,
      );
    });

    it("should include deletedId in response if provided", async () => {
      const apiKeyId = "key-1";
      mockReq.params = { apiKeyId };

      const mockResult = {
        message: "API key deleted successfully",
        deletedId: apiKeyId,
      };

      mockService.deleteApiKey.mockResolvedValue(mockResult);

      await controller.deleteApiKey(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message,
        data: {
          deletedId: apiKeyId,
        },
      });
    });

    it("should call next with error if service throws", async () => {
      const error = new Error("Service error");
      mockReq.params = { apiKeyId: "key-1" };
      mockService.deleteApiKey.mockRejectedValue(error);

      await controller.deleteApiKey(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
