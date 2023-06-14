const { PrismaClient } = require("@prisma/client");
const { UserSeeder } = require("./databaseSeeder");
const prisma = new PrismaClient();

const main = async () => {
  await prisma.user.create({
    data: UserSeeder,
  });
};

main()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
