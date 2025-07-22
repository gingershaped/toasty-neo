import { Host } from "@/lib/generated/prisma/client";
import { z } from "zod";

export function parseFormData<T extends z.ZodTypeAny>(form: FormData, schema: T): z.ZodSafeParseResult<z.output<T>>  {
    return schema.safeParse(
        Object.fromEntries([...form.entries()].map(([k, v]) => [k, v.toString()])),
    );
}
export const TIME_FORMAT = "MMM D, YYYY";

export const HOST_ADDRESSES: Record<Host, URL> = {
    "MSE": new URL("https://chat.meta.stackexchange.com"),
    "SE": new URL("https://chat.stackexchange.com"),
    "SO": new URL("https://chat.stackoverflow.com"),
};