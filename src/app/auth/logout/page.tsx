"use client";

import { useEffect } from "react";
import { logout } from "./actions";

export default function Logout() {
    useEffect(() => {
        logout();
    }, []);
    return <main className="mt-5 text-center">
        <div>
            <p className="fs-2">Logging out</p>
            <p>You will be redirected automatically</p>
        </div>
    </main>;
}