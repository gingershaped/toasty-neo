"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { User } from "@/lib/generated/prisma/client";
import { UserLink } from "../_components/UserLink";
import { LoadingLink } from "../_components/LoadingButton";

export type HeaderProps = {
    user: User | null,
    children: Record<string, string>,
};

export default function Header({ user, children: routeNames }: HeaderProps) {
    const segment = useSelectedLayoutSegment() ?? "/";
    return <nav className="navbar navbar-expand-md bg-body-tertiary">
        <div className="container-fluid">
            <Link className="navbar-brand" href="/">Toasty</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarToggler">
                <div className="navbar-nav me-auto">
                    {Object.entries(routeNames).map(([routeSegment, label]) => (
                        <Link
                            href={`/${routeSegment}`}
                            key={routeSegment}
                            className={routeSegment == segment ? "nav-link active" : "nav-link"}
                            aria-current={routeSegment == segment ? "page" : undefined}
                        >{label}</Link>
                    ))}
                </div>
                {user != null ? (
                    <div className="navbar-nav dropdown">
                        <UserLink user={user} className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" showLocked />
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><Link className="dropdown-item" href={`/users/${user.networkId}`}>Profile</Link></li>
                            <li><Link className="dropdown-item text-danger" href="/auth/logout">Log out</Link></li>
                        </ul>
                    </div>
                ) : <LoadingLink variant="primary" href="/auth/login">Log in</LoadingLink>}
            </div>
        </div>
    </nav>;
}