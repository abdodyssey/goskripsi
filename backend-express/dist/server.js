"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const errorHandler_1 = require("./middlewares/errorHandler");
const prisma_1 = require("./utils/prisma");
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        errorHandler_1.logger.info("Connected to Database successfully using Prisma");
        const server = app_1.default.listen(PORT, () => {
            errorHandler_1.logger.info(`Server is listening on port ${PORT}`);
        });
        // Graceful Shutdown
        process.on("SIGTERM", async () => {
            errorHandler_1.logger.info("SIGTERM received. Shutting down gracefully");
            await prisma_1.prisma.$disconnect();
            server.close(() => process.exit(0));
        });
    }
    catch (error) {
        errorHandler_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
