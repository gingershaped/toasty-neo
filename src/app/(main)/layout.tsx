import { ReactNode } from "react";
import Header from "./Header";
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
        <main className="container-lg mt-5 mb-3 flex-grow-1">
            {children}
        </main>
        <footer className="bg-body-tertiary border-top ps-4 p-2 mt-auto text-muted d-flex flex-column flex-sm-row">
            <p className="mb-0 me-auto">
                ◈ Built by <a href="https://codegolf.stackexchange.com/users/108218/">Ginger</a>
                {" "}for the fine people of <a href="https://stackexchange.net">Stack Exchange</a>
                <br />
                Server and domain generously provided by
                {" "}<a href="https://langdev.stackexchange.com/users/5/rydwolf-programs">rydwolf</a>
            </p>
            <p className="mb-0 align-self-sm-end">
                <a href="https://chat.stackexchange.com/rooms/148706/i-cant-believe-its-not-botter">chat</a>
                <span>&nbsp;•&nbsp;</span>
                <a href="https://github.com/gingershaped/toasty-neo">source</a>
                <span>&nbsp;•&nbsp;</span>
                <a href="https://stackapps.com/q/10422/91091">stackapps</a>
            </p>
        </footer>
    </>;
}