import prisma from "../../prisma/client.js";

export class ApiKeyRepository {
  async findApiKeysByUserId(userId) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findApiKeyById(id) {
    return prisma.apiKey.findUnique({
      where: { id },
    });
  }

  async findApiKeyByKey(apiKey) {
    return prisma.apiKey.findUnique({
      where: { apiKey },
    });
  }

  async createApiKey(data) {
    return prisma.apiKey.create({
      data,
    });
  }

  async deleteApiKey(id) {
    return prisma.apiKey.delete({
      where: { id },
    });
  }

  async deleteApiKeyByKey(apiKey) {
    return prisma.apiKey.delete({
      where: { apiKey },
    });
  }

  async updateApiKey(id, data) {
    return prisma.apiKey.update({
      where: { id },
      data,
    });
  }
}

export default ApiKeyRepository;
