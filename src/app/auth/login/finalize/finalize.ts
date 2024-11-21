"use server";

import { environ } from "@/lib/environ";
import { networkUserSchema, seRequest, siteUserSchema } from "@/lib/se";
import { NextResponse } from "next/server";
import { MINIMUM_REPUTATION, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, SessionPayload } from "../../session";
import sites from "@/lib/sites";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function finalizeLogin(code: string | null) {
    if (code == null) {
        redirect("/");
    }
    const tokenPayload = new FormData();
    tokenPayload.set("client_id", environ.SE_CLIENT_ID);
    tokenPayload.set("client_secret", environ.SE_CLIENT_SECRET);
    tokenPayload.set("redirect_uri", new URL("/auth/login/finalize", environ.SE_OAUTH_DOMAIN).toString());
    tokenPayload.set("code", code);
    const tokenResponse = await fetch(
        "https://stackoverflow.com/oauth/access_token/json",
        { body: tokenPayload, method: "POST" },
    ).then((r) => r.json());
    if ("error" in tokenResponse) {
        return NextResponse.json(tokenResponse, { status: 500 });
    }
    const { access_token: token } = tokenResponse;

    const associated = await seRequest("/me/associated?types=main_site&filter=!--43sh-c)9wP", networkUserSchema, token);
    const hasSufficientReputation = associated.some((user) => user.reputation >= MINIMUM_REPUTATION);
    const isModerator = associated.some((user) => user.user_type == "moderator");
    const role = hasSufficientReputation ? (isModerator ? Role.MODERATOR : Role.USER) : Role.UNVERIFIED;
    const primarySite = (await sites).get(associated.sort((a, b) => a.reputation - b.reputation).reverse()[0].site_url)!.api_site_parameter;
    const primaryAccount = (await seRequest(`/me?site=${primarySite}`, siteUserSchema, token))[0];

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
    await createSession<SessionPayload>(SESSION_COOKIE, { id: user.networkId }, SESSION_COOKIE_MAX_AGE);
    redirect("/");
}