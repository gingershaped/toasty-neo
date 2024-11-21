// ts-ignore 7017 is used to ignore the error that the global object is not
// defined in the global scope. This is because the global object is only
// defined in the global scope in Node.js and not in the browser.

import { environ } from "./environ";
import { Site, siteSchema } from "./se";

const globalForSites = global as unknown as { sites: Promise<Map<string, Site>> };

export const sites = globalForSites.sites || fetch(
    `https://api.stackexchange.com/2.3/sites?pagesize=65536&key=${environ.SE_KEY}&client_id=${environ.SE_CLIENT_ID}`,
).then((r) => r.json()).then(
    ({ items }: { items: Site[] }) => new Map(items.map((site) => siteSchema.parse(site)).map((site) => [site.site_url, site])),
);

if (process.env.NODE_ENV !== 'production') {
    globalForSites.sites = sites;
}

export default sites;