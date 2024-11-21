import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { z } from "zod";

const flashSchema = z.array(
    z.object({ severity: z.enum(["success", "danger", "warning", "info"]), message: z.string() }),
);
type Flash = z.infer<typeof flashSchema.element>;

const FLASH_COOKIE = "flash";
function parseFlashes(cookieStore: ReadonlyRequestCookies) {
    return flashSchema.safeParse(JSON.parse(cookieStore.get(FLASH_COOKIE)?.value ?? "[]")).data ?? [];
}
export async function flash(message: Flash) {
    const cookieStore = await cookies();
    const flashes = parseFlashes(cookieStore);
    flashes.push(message);
    cookieStore.set(FLASH_COOKIE, JSON.stringify(flashes));
}
export async function flashes() {
    const cookieStore = await cookies();
    const flashes = parseFlashes(cookieStore);
    cookieStore.delete(FLASH_COOKIE);
    return flashes;
}