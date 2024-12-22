"use server";

import { prisma } from "@/lib/globals";
import { Host } from "@prisma/client";
import { FETCH_SIZE } from "./constants";

export async function fetchRuns(host: Host, roomId: number, before: string | null) {
    return await prisma.antifreezeRun.findMany({
        take: FETCH_SIZE,
        cursor: before != null ? { id: before } : undefined,
        skip: before != null ? 1 : 0,
        where: {
            roomId, roomHost: host,
        },
        orderBy: { id: "desc" },
    });
}