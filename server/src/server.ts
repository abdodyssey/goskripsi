import "dotenv/config";
import app from "./app";
import { logger } from "./middlewares/errorHandler";
import { prisma } from "./utils/prisma";
const PORT = process.env.PORT || 4000;
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to Database successfully using Prisma");

    const server = app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
    });

    // Graceful Shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received. Shutting down gracefully");
      await prisma.$disconnect();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
