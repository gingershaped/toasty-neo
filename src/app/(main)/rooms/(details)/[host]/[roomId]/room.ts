import { g } from "@/lib/globals";
import { hostSchema } from "@/lib/schema";
import { Host, Prisma } from "@/lib/generated/prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

export type RoomParams = Promise<{ host: string, roomId: string }>;
export const getRoom = cache(async<I extends Prisma.Args<typeof g.prisma.room, "findUnique">["include"]>(params: RoomParams, include?: I) => {
    return await g.prisma.room.findUnique<{ where: { roomId_host: { roomId: number, host: Host } }, include: I }>({
        where: {
            // eslint-disable-next-line camelcase
            roomId_host: {
                roomId: parseInt((await params).roomId),
                host: hostSchema.safeParse((await params).host.toUpperCase()).data ?? notFound(),
            },
        },
        include: include as I,
    }) ?? notFound();
});