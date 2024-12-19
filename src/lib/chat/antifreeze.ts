import { Worker } from "bullmq";
import { AntifreezeResult } from "@prisma/client";
import { logger as rootLogger } from "../logger";
import { Credentials } from "./credentials";
import { Got } from "got";
import parse from "node-html-parser";
import { roomName as fetchRoomName } from "./util";
import { environ } from "../environ";

const logger = rootLogger.child({ module: "antifreeze" });

export type AntifreezeJob = {
    credentials: Credentials,
    roomId: number,
    message: string,
    threshold: number,
};

export type AntifreezeJobResult = {
    result: "OK" | "ANTIFREEZED", checkedAt: number, lastMessage: number | null,
} | {
    result: "ERROR", checkedAt: number, error: string,
};

async function scrapeFkey(client: Got) {
    const response = await client.get("chats/join/favorite");
    return parse(response.body).getElementById("fkey")?.attributes?.value ?? null;
}

type EventResponse = { events: { user_id: number, time_stamp: number }[] };

async function lastMessageInRoom(client: Got, fkey: string, roomId: number) {
    const body = new FormData();
    body.set("since", "0");
    body.set("mode", "Messages");
    body.set("msgCount", "100");
    body.set("fkey", fkey);
    const response = await client.post(`chats/${roomId}/events`, { body }).json<EventResponse>();
    const userMessages = response["events"].filter((msg) => msg["user_id"] > 0);
    if (userMessages.length == 0) {
        return null;
    }
    return new Date(userMessages.at(-1)!["time_stamp"] * 1000);
}

export async function antifreeze(job: AntifreezeJob): Promise<AntifreezeJobResult> {
    const { credentials, roomId, message, threshold } = job;
    const now = Date.now();
    logger.info(`Starting antifreeze job for room ${roomId} on host ${credentials.host}`);

    try {
        const client = credentials.client();
        const fkey = await scrapeFkey(client);
        if (fkey == null) {
            return { result: AntifreezeResult.ERROR, checkedAt: now, error: "Could not scrape fkey" };
        }

        const roomName = await fetchRoomName(credentials.host, roomId);
        logger.info(`Room name: ${roomName}`);
        const lastMessage = await lastMessageInRoom(client, fkey, roomId);
        logger.info(`Last message in room: ${lastMessage?.toISOString() ?? "<never>"}`);

        if (lastMessage == null || now - lastMessage.getTime() > threshold) {
            logger.info("Antifreezing!");
            const body = new FormData();
            body.set("text", message);
            body.set("fkey", fkey);
            const response = await client.post(`chats/${roomId}/messages/new`, { body }).json<string | object>();
            if (typeof response == "string") {
                return { result: AntifreezeResult.ERROR, checkedAt: now, error: response };
            } else {
                return { result: AntifreezeResult.ANTIFREEZED, checkedAt: now, lastMessage: lastMessage?.getTime() ?? null };
            }
        } else {
            logger.info("No antifreeze needed, skipping");
            return { result: AntifreezeResult.OK, checkedAt: now, lastMessage: lastMessage.getTime() };
        }
    } catch (error) {
        logger.error({ error }, "An error occured:");
        return { result: AntifreezeResult.ERROR, checkedAt: now, error: "An internal error occured" };
    }
}

export const worker = new Worker<AntifreezeJob, AntifreezeJobResult>("antifreeze", async(job) => {
    return await antifreeze(job.data);
}, {
    connection: {
        url: environ.REDIS_URL,
    },
});