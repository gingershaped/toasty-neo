"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

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

export type TabbedHeaderProps = {
    base: string,
    nav: Record<string, string>,
    children: ReactNode,
};

export function TabbedHeader({ base, nav, children }: TabbedHeaderProps) {
    return <div className="d-flex align-items-sm-end flex-column flex-sm-row mb-3">
        <h1 className="flex-grow-1 border-bottom-sm m-0 pb-2 pb-sm-1">
            {children}
        </h1>
        <Navigation base={base} style="tabs">
            {nav}
        </Navigation>
    </div>;
}