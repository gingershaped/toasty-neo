"use server";

import { Host, Role, User } from "@/lib/generated/prisma";
import { RoomEditLevel } from "./common";
import { userCanEdit } from "@/lib/auth/utils";
import { fetchUserOwnedRooms } from "@/lib/chat/fetch";

export async function userEditLevel(user: User | null, room: { host: Host, roomId: number } | null): Promise<RoomEditLevel> {
    if (user === null) {
        return RoomEditLevel.READONLY;
    }
    
    if (!userCanEdit(user)) {
        return RoomEditLevel.READONLY;
    }

    if (user.role === Role.DEVELOPER) {
        return RoomEditLevel.DEVELOPER;
    }

    if (user.role === Role.MODERATOR) {
        return RoomEditLevel.MODERATOR;
    }

    if (room !== null) {
        const ownedRooms = await fetchUserOwnedRooms(room.host, user.networkId);
        if (!ownedRooms.some(({ id }) => parseInt(id) === room.roomId)) {
            return RoomEditLevel.READONLY;
        }
    }

    return RoomEditLevel.USER;
}