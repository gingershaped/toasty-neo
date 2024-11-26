"use server";

import { environ } from "@/lib/environ";
import { networkUserSchema, seRequest, siteUserSchema } from "@/lib/se";
import { MINIMUM_REPUTATION } from "../../lib/auth/session";
import sites from "@/lib/globals";

type TokenReturn = { token: string, error: undefined, success: true } | { token: undefined, error: object, success: false };

export async function fetchToken(code: string): Promise<TokenReturn> {
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
        return { token: undefined, error: tokenResponse.error, success: false };
    }
    return { token: tokenResponse.access_token, error: undefined, success: true };
}

export async function fetchAccountDetails(token: string) {
    const associated = await seRequest("/me/associated?types=main_site&filter=!--43sh-c)9wP", networkUserSchema, token);
    const hasSufficientReputation = associated.some((user) => user.reputation >= MINIMUM_REPUTATION);
    const isModerator = associated.some((user) => user.user_type == "moderator");
    const primarySite = (await sites).get(associated.sort((a, b) => a.reputation - b.reputation).reverse()[0].site_url)!.api_site_parameter;
    const primaryAccount = (await seRequest(`/me?site=${primarySite}`, siteUserSchema, token))[0];

    return { associated, primaryAccount, hasSufficientReputation, isModerator };
}

