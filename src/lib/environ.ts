import { Host } from "@prisma/client";
import { z } from "zod";
import { Credentials } from "./chat/credentials";

const environSchema = z.object({
    DATABASE_URL: z.string().url(),
    SESSION_KEY: z.string().base64(),
    SE_CLIENT_ID: z.string(),
    SE_CLIENT_SECRET: z.string(),
    SE_KEY: z.string(),
    SE_OAUTH_DOMAIN: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]),
    SE_EMAIL: z.string(),
    SE_PASSWORD: z.string(),
    ANTIFREEZE_THRESHOLD: z.coerce.number(),
});

export const environ = environSchema.parse(process.env);