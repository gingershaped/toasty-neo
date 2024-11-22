import { Role, User } from "@prisma/client";
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

export type UserLinkProps = {
    user: User,
    href?: string,
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

const BADGES: Record<Role, [string, string] | null> = {
    "DEVELOPER": ["Dev", "orange"],
    "LOCKED": ["Locked", "secondary"],
    "MODERATOR": ["Mod", "primary"],
    "UNVERIFIED": ["Unverified", "danger"],
    "USER": null,
};

export function UserLink({ user, href, ...props }: UserLinkProps) {
    const [label, color] = BADGES[user.role] ?? [null, null];
    return <Link href={href ?? `/users/${user.networkId}`} {...{...props, className: props.className + " text-decoration-none"}}>
        <span>{user.username}</span>
        {label != null && <span className={`badge text-bg-${color} ms-2 me-1`}>{label}</span>}
    </Link>;
}