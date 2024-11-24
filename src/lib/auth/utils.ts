import { Role } from "@prisma/client";

export function canModerate(role: Role) {
    return ["MODERATOR", "DEVELOPER"].includes(role);
}
