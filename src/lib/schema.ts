import type { Host } from "@prisma/client";
import { z } from "zod";

export const hostSchema = z.enum<string, [Host, ...Host[]]>(["SO", "SE", "MSE"]);