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
}

export default AuthRepository;
