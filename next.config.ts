import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.sstatic.net",
            },
        ],
    },
    serverExternalPackages: ["pino", "pino-pretty"],
    sassOptions: {
        silenceDeprecations: ["import", "legacy-js-api"],
        quietDeps: true,
    },
};

export default nextConfig;
