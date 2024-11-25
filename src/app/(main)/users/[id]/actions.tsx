"use server";

import { readUserSession } from "@/lib/auth/session";
import { canModerate } from "@/lib/auth/utils";
import prisma from "@/lib/db";
import { roleSchema } from "@/lib/schema";
import { parseFormData } from "@/lib/util";
import { redirect } from "next/navigation";
import { z } from "zod";

const modOptionsSchema = z.object({
    networkId: z.coerce.number(),
    locked: z.coerce.boolean(),
    role: roleSchema.optional(),
});

export async function updateModOptions(form: FormData) {
    const currentUser = await readUserSession();
    if (currentUser == null || !canModerate(currentUser.role)) {
        return;
    }
    const { data, success } = parseFormData(form, modOptionsSchema);
    if (!success) {
        return;
    }
    if (data.role != undefined && currentUser.role != "DEVELOPER") {
        return;
    }
    if ((await prisma.user.findUnique({ where: { networkId: data.networkId } })) == null) {
        return;
    }
    await prisma.user.update({
        where: { networkId: data.networkId },
        data: {
            locked: data.locked,
            role: data.role,
        },
    });
    redirect(`/users/${data.networkId}`);
}