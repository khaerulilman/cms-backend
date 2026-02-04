import { PrismaClient } from '@prisma/client';

let prisma;

export function getPrismaTestClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function cleanDatabase() {
  const prisma = getPrismaTestClient();

  // Delete in order to respect foreign key constraints
  await prisma.cmsCell.deleteMany();
  await prisma.cmsRow.deleteMany();
  await prisma.cmsColumn.deleteMany();
  await prisma.cmsTable.deleteMany();
  await prisma.project.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export async function createTestUser(data = {}) {
  const prisma = getPrismaTestClient();
  return await prisma.user.create({
    data: {
      email: data.email || 'test@example.com',
      password: data.password || 'hashedpassword',
      name: data.name || 'Test User',
      ...data,
    },
  });
}

export async function createTestProject(userId, data = {}) {
  const prisma = getPrismaTestClient();
  return await prisma.project.create({
    data: {
      userId,
      name: data.name || 'Test Project',
      description: data.description || 'Test Description',
      ...data,
    },
  });
}

export async function createTestTable(projectId, data = {}) {
  const prisma = getPrismaTestClient();
  return await prisma.cmsTable.create({
    data: {
      projectId,
      name: data.name || 'Test Table',
      isSubTable: data.isSubTable || false,
      ...data,
    },
  });
}
