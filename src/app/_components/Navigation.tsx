"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export type NavigationProps = {
    style?: "tabs" | "pills" | "underline",
    base: string,
    children: Record<string, string>,
};

export function Navigation({ style, base, children: routeNames }: NavigationProps) {
    const segment = useSelectedLayoutSegment() ?? "";
    return <nav className={`nav ${style ? `nav-${style}` : ""} flex-nowrap`}>
        {Object.entries(routeNames).map(([routeSegment, label]) => (
            <Link
                href={routeSegment.startsWith("/") ? routeSegment : `${base}/${routeSegment}`}
                key={routeSegment}
                className={routeSegment == segment ? "nav-link active" : "nav-link"}
                aria-current={routeSegment == segment ? "page" : undefined}
            >{label}</Link>
        ))}
    </nav>;
}