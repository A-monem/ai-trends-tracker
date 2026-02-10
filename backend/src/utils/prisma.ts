import { PrismaClient } from "@prisma/client";

// Declare global type for development singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client singleton
// In development, store in global to prevent multiple instances during hot reload
const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// Store in global for development
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
