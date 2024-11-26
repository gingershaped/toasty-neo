import { prisma } from "@/lib/globals";
import { readSessionCookie } from "@/lib/auth/cookie";
import { z } from "zod";

export const MINIMUM_REPUTATION = 200;
export const sessionPayload = z.object({
    id: z.number(),
});
export type SessionPayload = z.infer<typeof sessionPayload>;
export const SESSION_COOKIE = "session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export async function readUserSession() {
    const session = await readSessionCookie(SESSION_COOKIE, sessionPayload);
    if (session == null) {
        return null;
    }
    return await prisma.user.findUnique({ where: { networkId: session.id } });
}

export const updateDetailsPayload = z.object({
    // eslint-disable-next-line camelcase
    associated: z.array(z.object({ site_url: z.string(), site_name: z.string() })),
    token: z.string(),
});
export type UpdateDetailsPayload = z.infer<typeof updateDetailsPayload>;
export const UPDATE_DETAILS_COOKIE = "associated";
export const UPDATE_DETAILS_MAX_AGE = 60 * 60; // 1 hour