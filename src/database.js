require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// tenta pegar de onde você já vinha usando
const databaseUrl = process.env.DB_PROVIDER_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DB_PROVIDER_URL (ou DATABASE_URL) não definido no .env. Ex: mariadb://user:pass@localhost:3306/rpg_db",
  );
}

// Prisma 7 exige adapter OU accelerateUrl
const adapter = new PrismaMariaDb(databaseUrl);

const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
