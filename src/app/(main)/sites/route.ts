import { g } from "@/lib/globals";

export async function GET() {
    const sites = await g.sites;
    return Response.json(Object.fromEntries(sites.entries()));
}