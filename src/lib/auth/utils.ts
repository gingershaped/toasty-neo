import { User } from "@/lib/generated/prisma/client";

export function userCanModerate(user: User) {
    return userCanEdit(user) && ["MODERATOR", "DEVELOPER"].includes(user.role);
}
export function userCanEdit(user: User) {
    return !user.locked && user.role != "UNVERIFIED";
}