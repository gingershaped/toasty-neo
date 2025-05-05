"use client";

import { MouseEventHandler, ReactNode, useState } from "react";
import { useFormStatus } from "react-dom";

type LoadingContentProps = {
    loading: boolean,
    children: ReactNode,
};

function LoadingContent({ loading, children }: LoadingContentProps) {
    return <>
        {loading && (
            <span className="position-absolute top-50 start-50 translate-middle ">
                <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </span>
            </span>
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
    children: ReactNode,
};

export function LoadingButton({ loading, variant, disabled, className, onClick, children }: LoadingButtonProps) {
    return <button className={`btn btn-${variant} position-relative ${className ?? ""}`} disabled={(disabled ?? false) || loading} onClick={onClick}>
        <LoadingContent loading={loading}>{children}</LoadingContent>
    </button>;
}

type LoadingSubmitButtonProps = {
    variant: string,
    className?: string,
    type?: "submit" | "reset",
    formAction?: ((formData: FormData) => void | Promise<void>),
    disabled?: boolean,
    children: ReactNode,
};

export function LoadingSubmitButton({ variant, className, type, formAction, disabled: forceDisabled, children }: LoadingSubmitButtonProps) {
    const { pending, action } = useFormStatus();
    const loading = pending && action === formAction;
    const disabled = loading || forceDisabled;
    return <button className={`btn btn-${variant} position-relative ${className ?? ""}`} disabled={disabled} type={type ?? "submit"} formAction={formAction}>
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
        <a
            href={href}
            className={`position-relative btn btn-${variant} ${className ?? ""} ${loading ? "disabled" : ""}`}
            role="button"
            onClick={() => setLoading(true)}
        >
            <LoadingContent loading={loading}>{children}</LoadingContent>
        </a>
    );
}
