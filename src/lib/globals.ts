// ts-ignore 7017 is used to ignore the error that the global object is not
// defined in the global scope. This is because the global object is only
// defined in the global scope in Node.js and not in the browser.

import { PrismaClient } from '@prisma/client';
import { environ } from './environ';
import { Site, siteSchema } from './se';
import { Queue } from 'bullmq';

const globals = global as unknown as {
    prisma: PrismaClient,
    sites: Promise<Map<string, Site>>,
    queue: Queue,
};

export const prisma = globals.prisma || new PrismaClient();
export const sites = globals.sites || (
    fetch(`https://api.stackexchange.com/2.3/sites?pagesize=65536&key=${environ.SE_KEY}&client_id=${environ.SE_CLIENT_ID}`)
        .then((r) => r.json())
        .then(({ items }: { items: Site[] }) => {
            return new Map(items.map((site) => siteSchema.parse(site)).map((site) => [site.site_url, site]));
        })
);
export const queue = new Queue("antifreeze");

if (environ.NODE_ENV != "production") {
    globals.prisma = prisma;
    globals.sites = sites;
}