"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
    revalidatePath("/", "layout");
    redirect("/");
}