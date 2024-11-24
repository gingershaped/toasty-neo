import { ReactNode } from "react";
import Header from "../_components/Header";
import { readUserSession } from "../../lib/auth/session";
import { flashes } from "../flash";

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
        {flashList.length > 0 && (
            <div className="container-sm">
                {flashList.map(({ message, severity }, index) => (
                    <div key={index} className={`alert alert-${severity} alert-dismissible fade show mt-3`} role="alert">
                        {message}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                ))}
            </div>
        )}
        <main className="container-lg mt-5">
            {children}
        </main>
    </>;
}