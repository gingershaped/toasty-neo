import { ReactNode } from "react";
import Header from "../_components/Header";
import { readUserSession } from "../../lib/auth/session";

export default async function MainLayout({ children }: { children: ReactNode }) {
    const user = await readUserSession();
    return <>
        <Header user={user}>
            {{
                "rooms": "Rooms",
                "users": "Users",
                "rooms/add": "Add room",
            }}
        </Header>
        <main className="container-lg mt-5">
            {children}
        </main>
    </>;
}