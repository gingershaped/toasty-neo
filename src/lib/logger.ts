import pino from "pino";
import { environ } from "./environ";

export const logger = pino(
    environ.NODE_ENV == "production" ? {
        level: "info",
    } : {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        },
        level: "debug",
    },
);