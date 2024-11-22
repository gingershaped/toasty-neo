import { MouseEventHandler, ReactNode } from "react";

type LoadingButtonProps = {
    loading: boolean,
    variant: string,
    disabled?: boolean,
    className?: string,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    type?: "submit" | "reset" | "button",
    children: ReactNode,
};

export function LoadingButton({ loading, variant, disabled, className, onClick, type, children }: LoadingButtonProps) {
    return <button className={`btn btn-${variant} position-relative ${className}`} disabled={(disabled ?? false) || loading} onClick={onClick} type={type}>
        {loading && (
            <div className="position-absolute top-50 start-50 translate-middle ">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )}
        <span style={{ opacity: loading ? 0 : 1 }}>{children}</span>
    </button>;
}                                                                                                                         