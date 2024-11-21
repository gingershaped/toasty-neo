"use client";

import { useEffect } from "react";
import { finalizeLogin } from "./finalize";
import { useSearchParams } from "next/navigation";

export default function LoginFinalize() {
    const code = useSearchParams().get("code");
    useEffect(() => {
        finalizeLogin(code);
    }, [code]);
    return <main className="mt-5 text-center">
        <div>
            <p className="fs-2">Completing login</p>
            <p>You will be redirected automatically</p>
        </div>
    </main>;
}