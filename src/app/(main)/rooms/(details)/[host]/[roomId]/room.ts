import prisma from "@/lib/db";
import { hostSchema } from "@/lib/schema";
import { Host, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

export const TIME_FORMAT = "MMM D, YYYY";

export type RoomParams = Promise<{ host: string, roomId: string }>;
export const getRoom = cache(async<I extends Prisma.Args<typeof prisma.room, "findUnique">["include"]>(params: RoomParams, include?: I) => {
    return await prisma.room.findUnique<{ where: { roomId_host: { roomId: number, host: Host } }, include: I }>({
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