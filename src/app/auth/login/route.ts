import { environ } from "@/lib/environ";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const target = new URL("https://stackoverflow.com/oauth");
    target.searchParams.set("client_id", environ.SE_CLIENT_ID);
    target.searchParams.set("scope", "");
    target.searchParams.set("redirect_uri", new URL("/auth/login/finalize", environ.SE_OAUTH_DOMAIN).toString());
    target.searchParams.set("state", request.nextUrl.searchParams.get("state") ?? "");
    redirect(target.toString());
}