import { createLogger, format, transports } from "winston";
import { ENV } from "./env.js";

const { combine, timestamp, colorize, printf, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`),
);

const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  level: ENV.NODE_ENV === "production" ? "warn" : "http",
  format: ENV.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

/**
 * Log a business action with structured metadata.
 * Output: [action] | key=value key=value
 */
export function logAction(
  action: string,
  meta: Record<string, unknown> = {},
): void {
  const metaStr = Object.keys(meta).length
    ? ` | ${Object.entries(meta)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ")}`
    : "";
  logger.info(`[${action}]${metaStr}`);
}

export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
