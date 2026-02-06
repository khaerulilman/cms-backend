import prisma from "../../prisma/client.js";

export class AuthRepository {
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data) {
    return prisma.user.create({
      data,
    });
  }

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Refresh Token methods
  async createRefreshToken(data) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getUserActiveTokens(userId) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default AuthRepository;
