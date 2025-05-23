import pino from "pino";

export const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
        },
    },
    level: "debug",
    serializers: {
        error: pino.stdSerializers.errWithCause,
    },
});