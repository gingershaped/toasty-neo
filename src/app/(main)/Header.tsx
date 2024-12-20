"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { User } from "@prisma/client";
import { UserLink } from "../_components/UserLink";
import { LoadingLink } from "../_components/LoadingButton";

export type HeaderProps = {
    user: User | null,
    children: Record<string, string>,
};

export default function Header({ user, children: routeNames }: HeaderProps) {
    const segment = useSelectedLayoutSegment() ?? "/";
    return <nav className="navbar navbar-expand bg-body-tertiary">
        <div className="container-lg">
            <Link className="navbar-brand" href="/">Toasty</Link>
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
                <div className="nav-item dropdown">
                    <UserLink user={user} className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" showLocked />
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li><Link className="dropdown-item" href={`/users/${user.networkId}`}>Profile</Link></li>
                        <li><Link className="dropdown-item text-danger" href="/auth/logout">Log out</Link></li>
                    </ul>
                </div>
            ) : <LoadingLink variant="primary" href="/auth/login">Log in</LoadingLink>}
        </div>
    </nav>;
}