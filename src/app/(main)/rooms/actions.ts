"use server";

import { readUserSession } from "@/lib/auth/session";
import { userCanEdit, userCanModerate } from "@/lib/auth/utils";
import { roomName, userOwnedRooms } from "@/lib/chat/util";
import { prisma } from "@/lib/globals";
import { hostSchema } from "@/lib/schema";
import { parseFormData } from "@/lib/util";
import { Host, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { flash } from "../../../lib/flash";
import { credentialsForHost, environ } from "@/lib/environ";
import { antifreeze, saveAntifreezeResult } from "@/lib/chat/antifreeze";

const modifyRoomSchema = z.object({
    host: hostSchema,
    message: z.string().min(3).max(128),
    active: z.coerce.boolean(),
    locked: z.coerce.boolean(),
    roomId: z.union([z.coerce.number(), z.literal("custom")]),
    customRoomId: z.coerce.number().optional(),
}).refine(({ roomId, customRoomId }) => roomId == "custom" ? customRoomId != undefined : true);

const deleteOrCheckRoomSchema = z.object({
    host: hostSchema,
    roomId: z.coerce.number(),
});

export async function fetchOwnedRooms(host: Host) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const alreadyAddedRooms = new Set((await prisma.room.findMany({ where: { host, jobCreatorId: user.networkId } })).map(({ roomId }) => roomId));
    return (await userOwnedRooms(host, user.networkId)).filter(({ id }) => !alreadyAddedRooms.has(parseInt(id)));
}

export async function modifyRoom(form: FormData): Promise<{ errors: string[] }> {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, error, success } = parseFormData(form, modifyRoomSchema);
    if (!success) {
        return { errors: Object.entries(error.flatten().fieldErrors).flatMap(
            ([field, errors]) => errors.map((error) => `${field}: ${error}`),
        ) };
    }
    const ownedRooms = (await userOwnedRooms(data.host, user.networkId)).map(({ id }) => parseInt(id));
    if ((data.locked || data.roomId == "custom" || !ownedRooms.includes(data.roomId)) && !userCanModerate(user)) {
        return { errors: ["Insufficent permissions"] };
    }
    if (!userCanEdit(user)) {
        return { errors: ["Insufficent permissions"] };
    }
    const roomId = data.roomId == "custom" ? data.customRoomId! : data.roomId;
    const name = await roomName(data.host, roomId);
    if (name == null) {
        return { errors: ["Room does not exist"] };
    }
    await prisma.room.upsert({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {
                host: data.host,
                roomId,
            },
        },
        create: {
            antifreezeMessage: data.message,
            host: data.host,
            roomId,
            name,
            jobCreator: { connect: { networkId: user.networkId } },
            locked: data.locked,
            state: data.active ? "ACTIVE": "PAUSED",
        },
        update: {
            name,
            antifreezeMessage: data.message,
            locked: data.locked,
            state: data.active ? "ACTIVE" : "PAUSED",
        },
    });
    redirect(`/rooms/${data.host.toLowerCase()}/${roomId}`);
}

export async function deleteRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, success } = parseFormData(form, deleteOrCheckRoomSchema);
    if (!success) {
        return false;
    }
    const ownedRooms = (await userOwnedRooms(data.host, user.networkId)).map(({ id }) => parseInt(id));
    if (!ownedRooms.includes(data.roomId) && !userCanModerate(user)) {
        return false;
    }
    if (!userCanEdit(user)) {
        return false;
    }
    await prisma.room.delete({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {...data},
        },
    });
    flash({ message: "Room deleted", severity: "success" });
    redirect(`/rooms`);
}

export async function checkRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    if (user.role != Role.DEVELOPER) {
        return false;
    }
    const { data, success } = parseFormData(form, deleteOrCheckRoomSchema);
    if (!success) {
        return false;
    }

    const room = await prisma.room.findUnique({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: data,
        },
    });
    if (room == null) {
        return false;
    }

    const credentials = await credentialsForHost(data.host);
    const result = await antifreeze({
        credentials,
        roomId: data.roomId,
        message: room.antifreezeMessage,
        threshold: 60 * 60 * 24 * environ.ANTIFREEZE_THRESHOLD * 1000,
    });
    await saveAntifreezeResult(data.roomId, data.host, result);

    redirect(`/rooms/${data.host.toLowerCase()}/${data.roomId}/runs`);
}