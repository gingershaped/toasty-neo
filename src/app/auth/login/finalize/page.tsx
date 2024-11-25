"use client";

import { useEffect } from "react";
import { finalizeLogin } from "./actions";
import { useSearchParams } from "next/navigation";

export default function LoginFinalize() {
    const params = useSearchParams();
    useEffect(() => {
        finalizeLogin(params.get("code"), params.get("state"));
    }, [params]);
    return <main className="mt-5 text-center">
        <div>
            <p className="fs-2">Completing login</p>
            <p>You will be redirected automatically</p>
        </div>
    </main>;
}