import type { Host, Role } from "@/lib/generated/prisma/client";
import { z } from "zod";

export const hostSchema = z.enum<[Host, ...Host[]]>(["SO", "SE", "MSE"]);
export const roleSchema = z.enum<[Role, ...Role[]]>(["UNVERIFIED", "USER", "MODERATOR", "DEVELOPER"]);