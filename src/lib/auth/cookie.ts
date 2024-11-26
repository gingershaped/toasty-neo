import "server-only";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import type { TypeOf, ZodTypeAny } from "zod";
import { cookies } from "next/headers";
import { environ } from "../environ";

const sessionKey = new TextEncoder().encode(environ.SESSION_KEY);

export async function encrypt<T extends JWTPayload>(payload: T, expiry: Date) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(sessionKey);
}

export async function decrypt<T extends ZodTypeAny>(session: string, schema: T): Promise<TypeOf<T> | null> {
    try {
        const { payload } = await jwtVerify(session, sessionKey, { algorithms: ["HS256"] });
        return await schema.parseAsync(payload);
    } catch (error) {
        console.error("Failed to decrypt session", error);
        return null;
    }
}

export async function createSessionCookie<T extends JWTPayload>(cookie: string, payload: T, maxAgeSeconds: number) {
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
    const session = await encrypt(payload, expiresAt);
    (await cookies()).set(cookie, session, { httpOnly: true, expires: expiresAt });
}

export async function readSessionCookie<T extends ZodTypeAny>(cookie: string, schema: T): Promise<TypeOf<T> | null> {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(cookie)?.value;
    if (cookieValue == undefined) {
        return null;
    }
    const payload = await decrypt(cookieValue, schema);
    if (payload == null) {
        return null;
    }
    return payload;
}