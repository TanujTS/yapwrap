import { env } from "./src/config/env";
import { getLoggerConfig } from "./src/logger/config";
console.log("NODE_ENV:", env.NODE_ENV);
console.log("isDevelopment:", getLoggerConfig().isDevelopment);
