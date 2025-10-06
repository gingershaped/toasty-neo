"use server";

import { readUserSession } from "@/lib/auth/session";
import { credentialsForHost, fetchRoomName, fetchUserOwnedRooms } from "@/lib/chat/fetch";
import { g } from "@/lib/globals";
import { hostSchema } from "@/lib/schema";
import { parseFormData } from "@/lib/util";
import { Host, Role, RoomState } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { flash } from "../../../lib/flash";
import { environ } from "@/lib/environ";
import { antifreeze, saveAntifreezeResult } from "@/lib/chat/antifreeze";
import { userEditLevel } from "./_utils/server";
import { RoomEditLevel } from "./_utils/common";

const createRoomSchema = z.object({
    host: hostSchema,
    message: z.string().min(3).max(128),
    state: z.enum(["active", "paused"]).default("active"),
    locked: z.coerce.boolean(),
    roomId: z.union([z.coerce.number(), z.literal("custom")]),
    customRoomId: z.coerce.number().optional(),
}).refine(({ roomId, customRoomId }) => roomId == "custom" ? customRoomId !== undefined : true);

const modifyRoomSchema = z.object({
    host: hostSchema,
    message: z.string().min(3).max(128),
    state: z.enum(["active", "paused"]).default("active"),
    locked: z.coerce.boolean(),
    roomId: z.coerce.number(),
});

const roomKeySchema = z.object({
    host: hostSchema,
    roomId: z.coerce.number(),
});

export async function fetchAvailableRooms(host: Host) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const alreadyAddedRooms = new Set((await g.prisma.room.findMany({ where: { host, jobCreatorId: user.networkId } })).map(({ roomId }) => roomId));
    return (await fetchUserOwnedRooms(host, user.networkId)).filter(({ id }) => !alreadyAddedRooms.has(parseInt(id)));
}

export async function modifyRoom(form: FormData): Promise<{ errors: string[] }> {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, error, success } = parseFormData(form, modifyRoomSchema);
    if (!success) {
        return { errors: Object.entries(error.flatten().fieldErrors).flatMap(
            ([field, errors]) => errors.map((error) => `${field}: ${error}`),
        ) };
    }
    
    const roomName = await fetchRoomName(data.host, data.roomId);
    const room = await g.prisma.room.findUnique({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: data,
        },
    });
    
    if (room === null || roomName === null) {
        return { errors: ["This room no longer exists."] };
    }
    
    const editLevel = await userEditLevel(user, room);

    if (editLevel === RoomEditLevel.READONLY) {
        return { errors: ["You may not edit this room."] };
    }
    
    let newState: RoomState;
    if (data.state === "active") {
        newState = "ACTIVE";
    } else if (data.state === "paused" && room.state === "ERRORED") {
        newState = "ERRORED";
    } else {
        newState = "PAUSED";
    }

    await g.prisma.room.update({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {
                roomId: data.roomId,
                host: data.host,
            },
        },
        data: {
            name: roomName,
            antifreezeMessage: data.message,
            locked: editLevel >= RoomEditLevel.MODERATOR ? data.locked : undefined,
            state: newState,
        },
    });
    await flash({ message: "Changes saved!", severity: "success" });
    return { errors: [] };
}

export async function createRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, error, success } = parseFormData(form, createRoomSchema);
    if (!success) {
        return { errors: Object.entries(error.flatten().fieldErrors).flatMap(
            ([field, errors]) => errors.map((error) => `${field}: ${error}`),
        ) };
    }
    
    const roomId = data.roomId == "custom" ? data.customRoomId! : data.roomId;
    const roomName = await fetchRoomName(data.host, roomId);
    if (roomName == null) {
        return { errors: ["This rom does not exist."] };
    }

    const editLevel = await userEditLevel(user, null);

    if (editLevel === RoomEditLevel.READONLY) {
        return { errors: ["You may not create a job for this room."] };
    }

    let room = await g.prisma.room.findUnique({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {
                roomId,
                host: data.host,
            },
        },
    });

    if (room === null) {
        room = await g.prisma.room.create({
            data: {
                roomId,
                host: data.host,
                name: roomName,
                antifreezeMessage: data.message,
                locked: editLevel >= RoomEditLevel.MODERATOR ? data.locked : undefined,
                jobCreator: {
                    connect: {
                        networkId: user.networkId,
                    },
                },
            },
        });
        await antifreezeSingleRoom(room.roomId, room.host, room.antifreezeMessage);
    } else {
        await flash({ message: "This room already has an antifreeze job.", severity: "info" });
    }
    
    redirect(`/rooms/${data.host.toLowerCase()}/${roomId}`);
}

export async function deleteRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, success } = parseFormData(form, roomKeySchema);
    if (!success) {
        return false;
    }

    const editLevel = await userEditLevel(user, data);
    if (editLevel === RoomEditLevel.READONLY) {
        return false;
    }

    const deletedRoom = await g.prisma.room.delete({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {...data},
        },
    });
    flash({ message: `${deletedRoom.name} has been deleted.`, severity: "danger" });
    redirect(`/rooms`);
}

async function antifreezeSingleRoom(roomId: number, host: Host, message: string) {
    const credentials = await credentialsForHost(host);
    const result = await antifreeze({
        credentials,
        roomId: roomId,
        message,
        threshold: 60 * 60 * 24 * environ.ANTIFREEZE_THRESHOLD * 1000,
    });
    await saveAntifreezeResult(roomId, host, result);
}

export async function checkRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    if (user.role != Role.DEVELOPER) {
        return false;
    }
    const { data, success } = parseFormData(form, roomKeySchema);
    if (!success) {
        return false;
    }

    const room = await g.prisma.room.findUnique({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: data,
        },
    });
    if (room === null) {
        return false;
    }

    await antifreezeSingleRoom(data.roomId, data.host, room.antifreezeMessage);

    redirect(`/rooms/${data.host.toLowerCase()}/${data.roomId}/runs`);
}