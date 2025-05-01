import { Host } from "@prisma/client";

export const HOST_ADDRESSES: Record<Host, URL> = {
    "MSE": new URL("https://chat.meta.stackexchange.com"),
    "SE": new URL("https://chat.stackexchange.com"),
    "SO": new URL("https://chat.stackoverflow.com"),
};