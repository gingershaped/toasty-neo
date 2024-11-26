"use server";

import { readSessionCookie } from "@/lib/auth/cookie";
import { readUserSession, UPDATE_DETAILS_COOKIE, updateDetailsPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/globals";
import { seRequest, siteUserSchema } from "@/lib/se";
import sites from "@/lib/globals";
import { parseFormData } from "@/lib/util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateDetailsSchema = z.object({
    site: z.string(),
});

export async function updateDetails(form: FormData) {
    const user = await readUserSession();
    const detailsSession = await readSessionCookie(UPDATE_DETAILS_COOKIE, updateDetailsPayload);
    (await cookies()).delete(UPDATE_DETAILS_COOKIE);
    if (user == null || detailsSession == null) {
        return;
    }
    const { associated, token } = detailsSession;
    const { data, success } = parseFormData(form, updateDetailsSchema);
    if (!success) {
        return;
    }
    if (!associated.some(({ site_url: siteURL }) => siteURL == data.site)) {
        return;
    }
    const site = (await sites).get(data.site)!.api_site_parameter;
    const profile = (await seRequest(`/me?site=${site}`, siteUserSchema, token))[0];
    
    await prisma.user.update({
        where: { networkId: user.networkId },
        data: {
            username: profile.display_name,
            pfp: profile.profile_image,
        },
    });
    redirect(`/users/${user.networkId}`);
}