import type { Site } from "./lib/se";
import type { Globals } from "./lib/globals";

async function registerGlobals() {
    const { PrismaClient } = await import("@prisma/client");
    const { siteSchema } = await import("./lib/se");
    const { environ } = await import("./lib/environ");

    const globals = global as unknown as Globals;
    globals.prisma = new PrismaClient();
    globals.sites = await fetch(
        `https://api.stackexchange.com/2.3/sites?pagesize=65536&key=${environ.SE_KEY}&client_id=${environ.SE_CLIENT_ID}`,
    )
        .then((r) => r.json())
        .then(({ items }: { items: Site[] }) => {
            return new Map(
                items
                    .map((site) => siteSchema.parse(site))
                    .map((site) => [site.site_url, site]),
            );
        });
}

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { scheduledAntifreeze } = await import("@/lib/chat/antifreeze");
        const { logger } = await import("./lib/logger");
        const schedule = await import("node-schedule");

        logger.info("Starting up");
        await registerGlobals();
        schedule.scheduleJob("antifreeze", "0 0 * * *", scheduledAntifreeze);
        logger.info("Startup complete");
    }
}
