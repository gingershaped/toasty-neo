"use client";

import { useSearchParams } from "next/navigation";
import { Flash } from "../../lib/flash";

export function Alerts({ flashList }: { flashList: Flash[] }) {
    const params = useSearchParams();

    return <div className="toast-container position-absolute top-0 end-0 p-3">
        {flashList.length > 0 && flashList.map(({ message, severity }, index) => (
            <div key={index} className={`toast align-items-center text-bg-${severity} border-0 show`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body">
                        {message}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        ))}
        {params.has("unverified") && (
            <div className="toast align-items-center show bg-warning-subtle text-warning-emphasis border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body">
                        You have insufficient network-wide reputation to use Toasty; you need at least 200. <a href="/auth/login">Recheck reputation</a>
                    </div>
                </div>
            </div>
        )}
        {params.has("locked") && (
            <div className="toast align-items-center text-bg-danger border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex">
                    <div className="toast-body">
                        Your account has been locked for abuse.
                    </div>
                </div>
            </div>
        )}
    </div>;
}