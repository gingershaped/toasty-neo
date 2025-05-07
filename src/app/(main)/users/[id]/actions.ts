"use server";

import { readUserSession } from "@/lib/auth/session";
import { userCanModerate } from "@/lib/auth/utils";
import { g } from "@/lib/globals";
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
    if (currentUser == null || !userCanModerate(currentUser)) {
        return;
    }
    const { data, success } = parseFormData(form, modOptionsSchema);
    if (!success) {
        return;
    }
    if (data.role != undefined && currentUser.role != "DEVELOPER") {
        return;
    }
    const targetUser = await g.prisma.user.findUnique({ where: { networkId: data.networkId } });
    if (targetUser == null || (userCanModerate(targetUser) && currentUser.role != "DEVELOPER")) {
        return;
    }
    await g.prisma.user.update({
        where: { networkId: data.networkId },
        data: {
            locked: data.locked,
            role: data.role,
        },
    });
    redirect(`/users/${data.networkId}`);
}