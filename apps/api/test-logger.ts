import { logger } from "./src/logger";
import { getLoggerConfig } from "./src/logger/config";
console.log("log level config is:", getLoggerConfig().logLevel);
console.log("logger instance level is:", logger.level);
logger.info("Hello world from pino!");
logger.debug("Debug message");
