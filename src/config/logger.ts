import { createLogger, format, transports } from "winston";
import { ENV } from "./env.js";

const { combine, timestamp, colorize, printf, json } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
);

const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  level: ENV.NODE_ENV === "production" ? "warn" : "info",
  format: ENV.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

// Stream for morgan
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
