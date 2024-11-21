/* eslint-disable camelcase */
import { z } from "zod";
import { environ } from "./environ";

export const responseSchema = z.object({
    backoff: z.number().optional(),
    error_id: z.number().optional(),
    error_message: z.string().optional(),
    error_name: z.string().optional(),
    has_more: z.boolean(),
    items: z.array(z.any()),
});
export type Response = z.infer<typeof responseSchema>;

export const siteSchema = z.object({
    name: z.string(),
    api_site_parameter: z.string(),
    site_type: z.union([z.literal("main_site"), z.literal("meta_site")]),
    site_url: z.string(),
    icon_url: z.string(),
});
export type Site = z.infer<typeof siteSchema>;

const userSchema = z.object({
    account_id: z.number(),
    user_id: z.number(),
    reputation: z.number(),
    user_type: z.union([
        z.literal("unregistered"),
        z.literal("registered"),
        z.literal("moderator"),
        z.literal("team_admin"),
        z.literal("does_not_exist"),
    ]),
});

export const networkUserSchema = userSchema.extend({
    site_url: z.string(),
    site_name: z.string(),
});
export type NetworkUser = z.infer<typeof networkUserSchema>;

export const siteUserSchema = userSchema.extend({
    profile_image: z.string(),
    display_name: z.string(),
});
export type SiteUser = z.infer<typeof siteUserSchema>;

export async function seRequest<T extends z.ZodTypeAny>(endpoint: string, itemSchema: T, token: string, site?: string): Promise<z.infer<T>[]> {
    const items: z.infer<T>[] = [];
    let page = 1;
    while (true) {
        const url = new URL(endpoint, "https://api.stackexchange.com/2.3/");
        url.searchParams.set("page", page.toString());
        url.searchParams.set("key", environ.SE_KEY);
        url.searchParams.set("access_token", token);
        if (site != undefined) {
            url.searchParams.set("site", site);
        }
        const response = await fetch(url).then((r) => r.json());
        const payload = responseSchema.safeParse(response)?.data ?? null;
        if (payload == null || payload.error_name != undefined) {
            throw new Error("Response error occured!", { cause: response });
        }
        if (payload.backoff != undefined) {
            await new Promise((r) => setTimeout(r, payload.backoff! * 1000));
        }
        for (const item of payload.items) {
            try {
                items.push(itemSchema.parse(item));
            } catch (e) {
                throw new Error("Malformed item!", { cause: { item, error: e } });
            }
        }
        if (!payload.has_more) {
            break;
        }
        page++;
    }
    return items;
}