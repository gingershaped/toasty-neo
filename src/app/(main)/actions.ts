"use server";

import { readUserSession } from "@/lib/auth/session";
import { canModerate } from "@/lib/auth/utils";
import { roomName, userOwnedRooms } from "@/lib/chat";
import prisma from "@/lib/db";
import { hostSchema } from "@/lib/schema";
import { parseFormData } from "@/lib/util";
import { Host } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { flash } from "../flash";

const modifyRoomSchema = z.object({
    host: hostSchema,
    message: z.string().min(3).max(128),
    active: z.coerce.boolean(),
    locked: z.coerce.boolean(),
    roomId: z.union([z.coerce.number(), z.literal("custom")]),
    customRoomId: z.number().optional(),
}).refine(({ roomId, customRoomId }) => roomId == "custom" ? customRoomId != undefined : true);

const deleteRoomSchema = z.object({
    host: hostSchema,
    roomId: z.coerce.number(),
});

export async function fetchOwnedRooms(host: Host) {
    return await userOwnedRooms(host, (await readUserSession() ?? redirect("/auth/login")).networkId);
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
    if ((data.locked || data.roomId == "custom" || !ownedRooms.includes(data.roomId)) && !canModerate(user.role)) {
        return { errors: ["Insufficent permissions"] };
    }
    const roomId = data.roomId == "custom" ? data.customRoomId! : data.roomId;
    const name = await roomName(data.host, roomId);
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
            active: data.active,
        },
        update: {
            name,
            antifreezeMessage: data.message,
            locked: data.locked,
            active: data.active,
        },
    });
    redirect(`/rooms/${data.host.toLowerCase()}/${roomId}`);
}

export async function deleteRoom(form: FormData) {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, success } = parseFormData(form, deleteRoomSchema);
    if (!success) {
        return false;
    }
    const ownedRooms = (await userOwnedRooms(data.host, user.networkId)).map(({ id }) => parseInt(id));
    if (!ownedRooms.includes(data.roomId) && !canModerate(user.role)) {
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