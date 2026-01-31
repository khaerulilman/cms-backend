import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyRepository } from '../apikey.repository.js';
import prisma from '../../../prisma/client.js';

vi.mock('../../../prisma/client.js', () => ({
  default: {
    apiKey: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('ApiKeyRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new ApiKeyRepository();
    vi.clearAllMocks();
  });

  describe('findApiKeysByUserId', () => {
    it('should return all API keys for a user ordered by creation date', async () => {
      const userId = 'user-123';
      const mockKeys = [
        {
          id: 'key-1',
          userId,
          apiKey: 'sk_test123',
          createdAt: new Date('2025-01-15'),
        },
        {
          id: 'key-2',
          userId,
          apiKey: 'sk_test456',
          createdAt: new Date('2025-01-10'),
        },
      ];

      prisma.apiKey.findMany.mockResolvedValue(mockKeys);

      const result = await repository.findApiKeysByUserId(userId);

      expect(result).toEqual(mockKeys);
      expect(prisma.apiKey.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if user has no API keys', async () => {
      const userId = 'user-no-keys';
      prisma.apiKey.findMany.mockResolvedValue([]);

      const result = await repository.findApiKeysByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findApiKeyById', () => {
    it('should return API key by id', async () => {
      const mockKey = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
        createdAt: new Date(),
      };

      prisma.apiKey.findUnique.mockResolvedValue(mockKey);

      const result = await repository.findApiKeyById('key-1');

      expect(result).toEqual(mockKey);
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: { id: 'key-1' },
      });
    });

    it('should return null if API key not found', async () => {
      prisma.apiKey.findUnique.mockResolvedValue(null);

      const result = await repository.findApiKeyById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findApiKeyByKey', () => {
    it('should return API key by key value', async () => {
      const mockKey = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
        createdAt: new Date(),
      };

      prisma.apiKey.findUnique.mockResolvedValue(mockKey);

      const result = await repository.findApiKeyByKey('sk_test123');

      expect(result).toEqual(mockKey);
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: { apiKey: 'sk_test123' },
      });
    });
  });

  describe('createApiKey', () => {
    it('should create a new API key', async () => {
      const data = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
      };

      const mockCreatedKey = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.apiKey.create.mockResolvedValue(mockCreatedKey);

      const result = await repository.createApiKey(data);

      expect(result).toEqual(mockCreatedKey);
      expect(prisma.apiKey.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key by id', async () => {
      const mockDeletedKey = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
        createdAt: new Date(),
      };

      prisma.apiKey.delete.mockResolvedValue(mockDeletedKey);

      const result = await repository.deleteApiKey('key-1');

      expect(result).toEqual(mockDeletedKey);
      expect(prisma.apiKey.delete).toHaveBeenCalledWith({
        where: { id: 'key-1' },
      });
    });
  });

  describe('deleteApiKeyByKey', () => {
    it('should delete API key by key value', async () => {
      const mockDeletedKey = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
        createdAt: new Date(),
      };

      prisma.apiKey.delete.mockResolvedValue(mockDeletedKey);

      const result = await repository.deleteApiKeyByKey('sk_test123');

      expect(result).toEqual(mockDeletedKey);
      expect(prisma.apiKey.delete).toHaveBeenCalledWith({
        where: { apiKey: 'sk_test123' },
      });
    });
  });

  describe('updateApiKey', () => {
    it('should update API key data', async () => {
      const updateData = { updatedAt: new Date() };
      const mockUpdatedKey = {
        id: 'key-1',
        userId: 'user-123',
        apiKey: 'sk_test123',
        createdAt: new Date(),
        ...updateData,
      };

      prisma.apiKey.update.mockResolvedValue(mockUpdatedKey);

      const result = await repository.updateApiKey('key-1', updateData);

      expect(result).toEqual(mockUpdatedKey);
      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: updateData,
      });
    });
  });
});
