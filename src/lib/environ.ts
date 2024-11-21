import { z } from "zod";

const environSchema = z.object({
    DATABASE_URL: z.string().url(),
    SESSION_KEY: z.string().base64(),
    SE_CLIENT_ID: z.string(),
    SE_CLIENT_SECRET: z.string(),
    SE_KEY: z.string(),
    SE_OAUTH_DOMAIN: z.string().url(),
});

export const environ = environSchema.parse(process.env);