import { ReactNode } from "react";
import Header from "../_components/Header";
import { readUserSession } from "../../lib/auth/session";
import { flashes } from "../../lib/flash";
import { Alerts } from "./Alerts";

export default async function MainLayout({ children }: { children: ReactNode }) {
    const user = await readUserSession();
    const flashList = await flashes();
    return <>
        <Header user={user}>
            {{
                "rooms": "Rooms",
                "users": "Users",
                "rooms/add": "Add room",
            }}
        </Header>
        <Alerts flashList={flashList} />
        <main className="container-lg mt-5">
            {children}
        </main>
    </>;
}