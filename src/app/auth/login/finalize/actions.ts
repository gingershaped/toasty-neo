"use server";
import { createSessionCookie } from "@/lib/auth/cookie";
import { SessionPayload, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, UpdateDetailsPayload, UPDATE_DETAILS_COOKIE, UPDATE_DETAILS_MAX_AGE } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { fetchToken, fetchAccountDetails } from "../../actions";

export async function finalizeLogin(code: string | null, state: string | null) {
    if (code == null || state == null) {
        redirect("/");
    }
    const { token, error: tokenError, success: tokenSuccess } = await fetchToken(code);
    if (!tokenSuccess) {
        return { error: tokenError };
    }
    const { associated, primaryAccount, hasSufficientReputation, isModerator } = await fetchAccountDetails(token);
    const role = hasSufficientReputation ? (isModerator ? Role.MODERATOR : Role.USER) : Role.UNVERIFIED;
    const user = await prisma.user.upsert({
        create: {
            networkId: primaryAccount.account_id,
            username: primaryAccount.display_name,
            pfp: primaryAccount.profile_image,
            role,
        },
        update: {},
        where: {
            networkId: primaryAccount.account_id,
        },
    });
    await createSessionCookie<SessionPayload>(SESSION_COOKIE, { id: user.networkId }, SESSION_COOKIE_MAX_AGE);

    if (state == "details") {
        await createSessionCookie<UpdateDetailsPayload>(UPDATE_DETAILS_COOKIE, { associated, token }, UPDATE_DETAILS_MAX_AGE);
        redirect("/users/details");
    } else {
        redirect("/");
    }
}
