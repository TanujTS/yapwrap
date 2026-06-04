import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty();
const logger = pino({ level: "info" }, stream);
logger.info("testing pretty stream directly");
