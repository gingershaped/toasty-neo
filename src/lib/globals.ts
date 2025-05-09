// ts-ignore 7017 is used to ignore the error that the global object is not
// defined in the global scope. This is because the global object is only
// defined in the global scope in Node.js and not in the browser.

import { PrismaClient } from '@/lib/generated/prisma/client';
import { Site } from './se';

export type Globals = {
    prisma: PrismaClient,
    sites: Map<string, Site>,
};

export const g = global as unknown as Globals;