"use client";

import Link from "next/link";
import { MouseEventHandler, ReactNode, useState } from "react";

type LoadingContentProps = {
    loading: boolean,
    children: ReactNode,
};

function LoadingContent({ loading, children }: LoadingContentProps) {
    return <>
        {loading && (
            <div className="position-absolute top-50 start-50 translate-middle ">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )}
        <span style={{ opacity: loading ? 0 : 1 }}>{children}</span>
    </>;
}

type LoadingButtonProps = {
    loading: boolean,
    variant: string,
    disabled?: boolean,
    className?: string,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    type?: "submit" | "reset" | "button",
    formAction?: ((formData: FormData) => void | Promise<void>),
    children: ReactNode,
};

export function LoadingButton({ loading, variant, disabled, className, onClick, type, children, formAction }: LoadingButtonProps) {
    return <button className={`btn btn-${variant} position-relative ${className ?? ""}`} disabled={(disabled ?? false) || loading} onClick={onClick} type={type} formAction={formAction}>
        <LoadingContent loading={loading}>{children}</LoadingContent>
    </button>;
}

type LoadingLinkProps = {
    href: string,
    variant: string,
    className?: string,
    children: ReactNode,
};

export function LoadingLink({ href, variant, className, children }: LoadingLinkProps) {
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <Link
            href={href}
            className={`position-relative btn btn-${variant} ${className ?? ""} ${loading ? "disabled" : ""}`}
            role="button"
            onClick={() => setLoading(true)}
            preload={false}
        >
            <LoadingContent loading={loading}>{children}</LoadingContent>
        </Link>
    );
}
