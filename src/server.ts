import "./config/env.js";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { prisma } from "./config/db.js";
import logger from "./config/logger.js";

const PORT = ENV.PORT;

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  try {
    await prisma.$connect();
    logger.info("Database connected");
  } catch (error) {
    logger.error("Database connection failed", error);
  }
});
