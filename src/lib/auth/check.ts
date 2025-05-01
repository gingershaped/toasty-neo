import { User } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";

export async function checkPermissions(user: User) {
    if (user.locked) {
        redirect("/?locked");
    }
    if (user.role == "UNVERIFIED") {
        redirect("/?unverified");
    }
}