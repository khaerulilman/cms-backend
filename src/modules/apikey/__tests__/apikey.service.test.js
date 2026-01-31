import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiKeyService } from "../apikey.service.js";
import { NotFoundError } from "../../../utils/errors.js";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid-123"),
}));

describe("ApiKeyService", () => {
  let service;
  let mockRepository;
  let mockAuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      findApiKeysByUserId: vi.fn(),
      findApiKeyById: vi.fn(),
      findApiKeyByKey: vi.fn(),
      createApiKey: vi.fn(),
      deleteApiKey: vi.fn(),
      updateApiKey: vi.fn(),
    };

    mockAuthRepository = {
      findUserById: vi.fn(),
    };

    service = new ApiKeyService();
    // Replace the repository instances with our mocks
    service.repository = mockRepository;
    service.authRepository = mockAuthRepository;
  });

  describe("generateApiKey", () => {
    it("should generate a new API key for valid user", async () => {
      const userId = "user-123";
      mockAuthRepository.findUserById.mockResolvedValue({
        id: userId,
        email: "test@example.com",
      });

      mockRepository.createApiKey.mockResolvedValue({
        id: "mocked-uuid-123",
        userId,
        apiKey: "sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        createdAt: new Date(),
      });

      const result = await service.generateApiKey(userId);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("apiKey");
      expect(result).toHaveProperty("createdAt");
      expect(result.message).toBe("API key generated successfully");
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockRepository.createApiKey).toHaveBeenCalled();
    });

    it("should throw NotFoundError if user does not exist", async () => {
      const userId = "non-existent-user";
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(service.generateApiKey(userId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should generate API key with sk_ prefix", () => {
      const generatedKey = service._generateRandomApiKey();

      expect(generatedKey).toMatch(/^sk_[A-Za-z0-9]{32}$/);
      expect(generatedKey.length).toBe(35); // sk_ (3) + 32 chars
    });
  });

  describe("getApiKeys", () => {
    it("should return masked API keys for user", async () => {
      const userId = "user-123";
      mockAuthRepository.findUserById.mockResolvedValue({ id: userId });

      mockRepository.findApiKeysByUserId.mockResolvedValue([
        {
          id: "key-1",
          userId,
          apiKey: "sk_test1234567890123456789012",
          createdAt: new Date("2025-01-15"),
          updatedAt: new Date("2025-01-15"),
        },
        {
          id: "key-2",
          userId,
          apiKey: "sk_abcd1234567890123456789012ab",
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-10"),
        },
      ]);

      const result = await service.getApiKeys(userId);

      expect(result.userId).toBe(userId);
      expect(result.total).toBe(2);
      expect(result.apiKeys[0].apiKey).toMatch(/^sk_t\*+9012$/);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundError if user does not exist", async () => {
      const userId = "non-existent-user";
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(service.getApiKeys(userId)).rejects.toThrow(NotFoundError);
    });

    it("should return empty array if user has no API keys", async () => {
      const userId = "user-123";
      mockAuthRepository.findUserById.mockResolvedValue({ id: userId });
      mockRepository.findApiKeysByUserId.mockResolvedValue([]);

      const result = await service.getApiKeys(userId);

      expect(result.total).toBe(0);
      expect(result.apiKeys).toEqual([]);
    });
  });

  describe("deleteApiKey", () => {
    it("should delete API key if it belongs to user", async () => {
      const userId = "user-123";
      const apiKeyId = "key-1";

      mockAuthRepository.findUserById.mockResolvedValue({ id: userId });
      mockRepository.findApiKeyById.mockResolvedValue({
        id: apiKeyId,
        userId,
        apiKey: "sk_test123",
        createdAt: new Date(),
      });
      mockRepository.deleteApiKey.mockResolvedValue({
        id: apiKeyId,
        userId,
      });

      const result = await service.deleteApiKey(userId, apiKeyId);

      expect(result.message).toBe("API key deleted successfully");
      expect(mockRepository.deleteApiKey).toHaveBeenCalledWith(apiKeyId);
    });

    it("should throw NotFoundError if user does not exist", async () => {
      const userId = "non-existent-user";
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(service.deleteApiKey(userId, "key-1")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw NotFoundError if API key does not exist", async () => {
      const userId = "user-123";
      mockAuthRepository.findUserById.mockResolvedValue({ id: userId });
      mockRepository.findApiKeyById.mockResolvedValue(null);

      await expect(
        service.deleteApiKey(userId, "non-existent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if API key does not belong to user", async () => {
      const userId = "user-123";
      const apiKeyId = "key-1";

      mockAuthRepository.findUserById.mockResolvedValue({ id: userId });
      mockRepository.findApiKeyById.mockResolvedValue({
        id: apiKeyId,
        userId: "other-user",
        apiKey: "sk_test123",
      });

      await expect(service.deleteApiKey(userId, apiKeyId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("verifyApiKey", () => {
    it("should return key details if API key is valid", async () => {
      const apiKey = "sk_test123";
      mockRepository.findApiKeyByKey.mockResolvedValue({
        id: "key-1",
        userId: "user-123",
        apiKey,
      });

      const result = await service.verifyApiKey(apiKey);

      expect(result).toEqual({
        id: "key-1",
        userId: "user-123",
        apiKey,
      });
      expect(mockRepository.findApiKeyByKey).toHaveBeenCalledWith(apiKey);
    });

    it("should return null if API key is invalid", async () => {
      mockRepository.findApiKeyByKey.mockResolvedValue(null);

      const result = await service.verifyApiKey("invalid-key");

      expect(result).toBeNull();
    });
  });

  describe("_maskApiKey", () => {
    it("should mask API key showing first 4 and last 4 characters", () => {
      const apiKey = "sk_abcd1234567890123456789012ef";
      const masked = service._maskApiKey(apiKey);

      expect(masked).toBe("sk_a***********************12ef");
    });

    it("should return full key if length is 8 or less", () => {
      const shortKey = "sk_test";
      const masked = service._maskApiKey(shortKey);

      expect(masked).toBe(shortKey);
    });

    it("should correctly mask keys of different lengths", () => {
      const key30 = "a".repeat(30);
      const masked = service._maskApiKey(key30);

      expect(masked).toMatch(/^aaaa\*{22}aaaa$/);
    });
  });
});
