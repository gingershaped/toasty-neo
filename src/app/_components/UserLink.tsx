import { Role, User } from "@/lib/generated/prisma/client";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

const BADGES: Record<Role, [string, string] | null> = {
    "DEVELOPER": ["Dev", "orange"],
    "MODERATOR": ["Mod", "primary"],
    "UNVERIFIED": ["Unverified", "danger"],
    "USER": null,
};

export function RoleBadge({ role, className }: { role: Role, className?: string }) {
    const [label, color] = BADGES[role] ?? [null, null];
    return <>
        {label != null && <span className={`badge text-bg-${color} ${className ?? ""}`}>{label}</span>}
    </>;
}

type UserLinkProps = {
    user: User,
    href?: string,
    showLocked?: boolean,
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "children">;

export function UserLink({ user, href, showLocked, ...props }: UserLinkProps) {
    return <Link href={href ?? `/users/${user.networkId}`} {...{...props, className: (props.className ?? "") + " text-decoration-none me-1"}}>
        <span className="me-2">{user.username}</span>
        {(showLocked && user.locked) && <span className="badge text-bg-danger me-2">Locked</span>}
        <RoleBadge role={user.role} />
    </Link>;
}