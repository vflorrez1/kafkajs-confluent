import { LogEntry, LogLevel } from "./types";
import { authFailedString } from "../constants";

const CustomConsoleLogger =
  () =>
  (logConfigObject: LogEntry): void => {
    const { namespace, level, label, log } = logConfigObject;
    const prefix = namespace ? `[${namespace}] ` : "";

    const messageObject = {
      level: label,
      ...log,
      message: `${prefix}${log.message}`,
    };
    const message = JSON.stringify(messageObject, undefined, 4);

    // [SaslAuthenticator-PLAIN] SASL PLAIN authentication failed: Authentication failed
    if (
      namespace === "SaslAuthenticator-PLAIN" &&
      log.message.match(authFailedString)
    ) {
      // we need to emit auth failed metric
      console.log("AUTH FAILED in /logger/console.ts", log.message);
    }

    switch (level) {
      case LogLevel.INFO:
        return console.info(message);
      case LogLevel.ERROR:
        return console.error(message);
      case LogLevel.WARN:
        return console.warn(message);
      case LogLevel.DEBUG:
        return console.log(message);
    }
  };

export default CustomConsoleLogger;
