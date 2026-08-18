import { stripVTControlCharacters } from "node:util";
import { logger as honoLogger } from "hono/logger";

const logger = (service: string) =>
  honoLogger((message) => {
    const date = new Date();

    console.log(
      process.env.NODE_ENV === "production"
        ? JSON.stringify({
            _time: date.toISOString(),
            _msg: stripVTControlCharacters(message),
            service,
          })
        : `${date.toLocaleTimeString("en-001", {
            fractionalSecondDigits: 3,
            hour: "2-digit",
            hourCycle: "h23",
            minute: "2-digit",
            second: "2-digit",
          })} [${service}] ${message}`,
    );
  });

export default logger;
