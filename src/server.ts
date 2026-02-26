import "./config/env.js";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { prisma } from "./config/db.js";
import logger from "./config/logger.js";

const PORT = ENV.PORT;

// Catch anything that escapes Express (e.g. rejected promises outside routes, sync crashes)
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1); // crash fast — let the process manager restart it
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  try {
    await prisma.$connect();
    logger.info("Database connected");
  } catch (error) {
    logger.error("Database connection failed", error);
  }
});
