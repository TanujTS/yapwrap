import pino from "pino";
import path from "path";

const logger = pino({
  level: "debug",
  transport: {
    targets: [
      {
        level: "debug",
        target: "pino-pretty",
        options: { colorize: true, singleLine: true }
      },
      {
        level: "debug",
        target: "pino-roll",
        options: { file: path.join(__dirname, "logs/test.log"), maxSize: "1M" }
      }
    ]
  }
});

logger.info("testing array transport in bun");
setTimeout(() => console.log("done"), 100);
