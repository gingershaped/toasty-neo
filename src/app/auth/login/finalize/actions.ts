"use server";
import { createSessionCookie } from "@/lib/auth/cookie";
import { SessionPayload, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, UpdateDetailsPayload, UPDATE_DETAILS_COOKIE, UPDATE_DETAILS_MAX_AGE } from "@/lib/auth/session";
import { prisma } from "@/lib/globals";
import { Role } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import { fetchToken, fetchAccountDetails } from "../../actions";
import { revalidatePath } from "next/cache";
import { flash } from "@/lib/flash";
import { checkPermissions } from "@/lib/auth/check";

export async function finalizeLogin(code: string | null, state: string | null, errorDescription: string | null) {
    if (errorDescription != null) {
        await flash({ severity: "danger", message: `Login failed: ${errorDescription}` });
        redirect("/");
    }
    if (code == null) {
        redirect("/");
    }
    const { token, error: tokenError, success: tokenSuccess } = await fetchToken(code);
    if (!tokenSuccess) {
        return { error: tokenError };
    }
    const { associated, primaryAccount, hasSufficientReputation, isModerator } = await fetchAccountDetails(token);
    const newRole = hasSufficientReputation ? (isModerator ? Role.MODERATOR : Role.USER) : Role.UNVERIFIED;
    let user = await prisma.user.upsert({
        create: {
            networkId: primaryAccount.account_id,
            username: primaryAccount.display_name,
            pfp: primaryAccount.profile_image,
            role: newRole,
        },
        update: {},
        where: {
            networkId: primaryAccount.account_id,
        },
    });
    if (user.role != Role.DEVELOPER && user.role != newRole) {
        user = await prisma.user.update({
            where: { networkId: user.networkId },
            data: { role: newRole },
        });
    }

    revalidatePath("/");
    await createSessionCookie<SessionPayload>(SESSION_COOKIE, { id: user.networkId }, SESSION_COOKIE_MAX_AGE);

    if (state == "details") {
        await createSessionCookie<UpdateDetailsPayload>(UPDATE_DETAILS_COOKIE, { associated, token }, UPDATE_DETAILS_MAX_AGE);
        redirect("/users/details");
    } else {
        await checkPermissions(user);
        redirect("/");
    }
}
