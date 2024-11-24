import { z } from "zod";

export function parseFormData<T extends z.ZodTypeAny>(form: FormData, schema: T): z.SafeParseReturnType<z.input<T>, z.output<T>>  {
    return schema.safeParse(
        Object.fromEntries([...form.entries()].map(([k, v]) => [k, v.toString()])),
    );
}