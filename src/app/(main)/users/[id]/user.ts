import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

export type UserParams = Promise<{ id: string }>;
export const getUser = cache(async<I extends Prisma.Args<typeof prisma.user, "findUnique">["include"]>(params: UserParams, include?: I) => {
    return await prisma.user.findUnique<{ where: { networkId: number }, include: I }>({
        where: {
            networkId: parseInt((await params).id),          
        },
        include: include as I,
    }) ?? notFound();
});