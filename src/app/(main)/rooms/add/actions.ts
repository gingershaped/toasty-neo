"use server";

import { isModerator, readUserSession } from "@/app/auth/session";
import { roomName, userOwnedRooms } from "@/lib/chat";
import prisma from "@/lib/db";
import { hostSchema } from "@/lib/schema";
import { Host } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function fetchOwnedRooms(host: Host) {
    return await userOwnedRooms(host, (await readUserSession() ?? redirect("/auth/login")).networkId);
}

const newRoomSchema = z.object({
    host: hostSchema,
    message: z.string().min(3).max(128),
    active: z.coerce.boolean(),
    locked: z.coerce.boolean(),
    roomId: z.union([z.coerce.number(), z.literal("custom")]),
    customRoomId: z.number().optional(),
}).refine(({ roomId, customRoomId }) => roomId == "custom" ? customRoomId != undefined : true);

export async function addRoom(form: FormData): Promise<{ errors: string[] }> {
    const user = await readUserSession() ?? redirect("/auth/login");
    const { data, error, success } = newRoomSchema.safeParse(
        Object.fromEntries([...form.entries()].map(([k, v]) => [k, v.toString()])),
    );
    if (!success) {
        return { errors: Object.entries(error.flatten().fieldErrors).flatMap(
            ([field, errors]) => errors.map((error) => `${field}: ${error}`),
        ) };
    }
    const ownedRooms = (await userOwnedRooms(data.host, user.networkId)).map(({ id }) => parseInt(id));
    if ((data.locked || data.roomId == "custom" || !ownedRooms.includes(data.roomId)) && !isModerator(user)) {
        return { errors: ["Insufficent permissions"] };
    }
    const roomId = data.roomId == "custom" ? data.customRoomId! : data.roomId;
    await prisma.room.create({
        data: {
            antifreezeMessage: data.message,
            host: data.host,
            name: await roomName(data.host, roomId),
            roomId,
            jobCreator: { connect: { networkId: user.networkId } },
            locked: data.locked,
            active: data.active,
        },
    });
    redirect(`/rooms/${data.host.toLowerCase()}/${roomId}`);
}