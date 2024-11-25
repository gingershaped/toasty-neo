import { Role, User } from "@prisma/client";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

const BADGES: Record<Role, [string, string] | null> = {
    "DEVELOPER": ["Dev", "orange"],
    "MODERATOR": ["Mod", "primary"],
    "UNVERIFIED": ["Unverified", "danger"],
    "USER": null,
};

export function RoleBadge({ role }: { role: Role }) {
    const [label, color] = BADGES[role] ?? [null, null];
    return <>
        {label != null && <span className={`badge text-bg-${color}`}>{label}</span>}
    </>;
}

type UserLinkProps = {
    user: User,
    href?: string,
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export function UserLink({ user, href, ...props }: UserLinkProps) {
    return <Link href={href ?? `/users/${user.networkId}`} {...{...props, className: (props.className ?? "") + " text-decoration-none me-1"}}>
        <span className="me-2">{user.username}</span>
        <RoleBadge role={user.role} />
    </Link>;
}