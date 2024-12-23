import { AntifreezeResult, Host } from "@prisma/client";
import { logger as rootLogger } from "../logger";
import { Credentials } from "./credentials";
import { Got } from "got";
import parse from "node-html-parser";
import { roomName as fetchRoomName } from "./util";
import { prisma } from "../globals";
import schedule from "node-schedule";
import { credentialsForHost, environ } from "../environ";
import dayjs from "dayjs";

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
    return dayjs.unix(userMessages.at(-1)!["time_stamp"]);
}

export async function antifreeze(job: AntifreezeJob): Promise<AntifreezeJobResult> {
    const { credentials, roomId, message: rawMessage, threshold } = job;
    const now = dayjs();
    logger.info(`Starting antifreeze job for room ${roomId} on host ${credentials.host}`);

    try {
        const client = credentials.client();
        const fkey = await scrapeFkey(client);
        if (fkey == null) {
            return { result: AntifreezeResult.ERROR, checkedAt: now.valueOf(), error: "Could not scrape fkey" };
        }

        const roomName = await fetchRoomName(credentials.host, roomId);
        logger.info(`Room name: ${roomName}`);
        const lastMessage = await lastMessageInRoom(client, fkey, roomId);
        logger.info(`Last message in room: ${lastMessage?.toISOString() ?? "<never>"}`);
        
        if (lastMessage == null || now.diff(lastMessage, "days") > threshold) {
            logger.info("Antifreezing!");

            const message = rawMessage
                .replace("{days}", lastMessage != null ? `${now.diff(lastMessage, "days")}` : "???");

            const body = new FormData();
            body.set("text", message);
            body.set("fkey", fkey);
            const response = (await client.post(`chats/${roomId}/messages/new`, { body, throwHttpErrors: false })).body;
            if (!response.startsWith("{")) {
                return { result: AntifreezeResult.ERROR, checkedAt: now.valueOf(), error: response };
            } else {
                return { result: AntifreezeResult.ANTIFREEZED, checkedAt: now.valueOf(), lastMessage: lastMessage?.valueOf() ?? null };
            }
        } else {
            logger.info("No antifreeze needed, skipping");
            return { result: AntifreezeResult.OK, checkedAt: now.valueOf(), lastMessage: lastMessage.valueOf() };
        }
    } catch (error) {
        logger.error({ error }, "An error occured:");
        return { result: AntifreezeResult.ERROR, checkedAt: now.valueOf(), error: "An internal error occured" };
    }
}

export async function saveAntifreezeResult(roomId: number, host: Host, result: AntifreezeJobResult) {
    await prisma.antifreezeRun.create({
        data: {
            room: {
                connect: {
                    // eslint-disable-next-line camelcase
                    roomId_host: { roomId, host },
                },
            },
            result: result.result,
            checkedAt: new Date(result.checkedAt),
            lastMessage: result.result != "ERROR" && result.lastMessage != null ? new Date(result.lastMessage) : null,
            error: result.result == "ERROR" ? result.error : null,
        },
    });
    if (result.result == "ERROR") {
        await prisma.room.update({
            where: {
                // eslint-disable-next-line camelcase
                roomId_host: { roomId, host },
            },
            data: {
                state: "ERRORED",
            },
        });
    }
}

schedule.cancelJob("antifreeze");
schedule.scheduleJob("antifreeze", "* 0 * * *", async() => {
    logger.info("Starting scheduled antifreeze run");
    const rooms = await prisma.room.findMany({
        where: { state: "ACTIVE" },
    });
    logger.info(`${rooms.length} room(s) to antifreeze`);
    const credentials = {
        "SE": await credentialsForHost("SE"),
        "SO": await credentialsForHost("SO"),
        "MSE": await credentialsForHost("MSE"),
    };
    for (const room of rooms) {
        const result = await antifreeze({
            credentials: credentials[room.host],
            roomId: room.roomId,
            message: room.antifreezeMessage,
            threshold: environ.ANTIFREEZE_THRESHOLD,
        });
        await saveAntifreezeResult(room.roomId, room.host, result);
    }
    logger.info("Antifreeze completed");
});