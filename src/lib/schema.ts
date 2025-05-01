import type { Host, Role } from "@/lib/generated/prisma/client";
import { z } from "zod";

export const hostSchema = z.enum<string, [Host, ...Host[]]>(["SO", "SE", "MSE"]);
export const roleSchema = z.enum<string, [Role, ...Role[]]>(["UNVERIFIED", "USER", "MODERATOR", "DEVELOPER"]);