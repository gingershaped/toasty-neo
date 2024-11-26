"use client";

import { useSearchParams } from "next/navigation";
import { Flash } from "../../lib/flash";
import Link from "next/link";

export function Alerts({ flashList }: { flashList: Flash[] }) {
    const params = useSearchParams();

    return <div className="container-sm">
        {flashList.length > 0 && flashList.map(({ message, severity }, index) => (
            <div key={index} className={`alert alert-${severity} alert-dismissible fade show mt-3`} role="alert">
                {message}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        ))}
        {params.has("unverified") && (
            <div className="alert alert-warning mt-3" role="alert">
                <span>You have insufficient network-wide reputation to use Toasty; you need at least 200.&nbsp;</span>
                <Link href={"/auth/login"}>Recheck reputation</Link>
            </div>
        )}
        {params.has("locked") && (
            <div className="alert alert-danger mt-3" role="alert">
                <span>Your account has been locked for abuse.&nbsp;</span>
            </div>
        )}
    </div>;
}