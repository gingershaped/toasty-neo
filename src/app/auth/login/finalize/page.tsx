"use client";

import { useEffect } from "react";
import { finalizeLogin } from "./actions";

export default function LoginFinalize() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        finalizeLogin(params.get("code"), params.get("state"));
    }, []);
    return <main className="mt-5 text-center">
        <div>
            <p className="fs-2">Completing login</p>
            <p>You will be redirected automatically</p>
        </div>
    </main>;
}