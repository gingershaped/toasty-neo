"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Breadcrumbs() {
    const segments = useSelectedLayoutSegments();
    return <nav aria-label="breadcrumb">
        {segments.map((_, index, array) => array.slice(index)).map((path) => path.join("/")).map((path) => (
            <ol className="breadcrumb" key={path}>
                <li className="breadcrumb-item active" aria-current="page">Home</li>
            </ol>
        ))}
    </nav>;
}