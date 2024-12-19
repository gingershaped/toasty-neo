import { Navigation } from "@/app/_components/Navigation";
import { ReactNode } from "react";
import { getUser, UserParams } from "./user";
import { RoleBadge } from "@/app/_components/UserLink";

export default async function UserDetailsLayout({ params, children }: { params: UserParams, children: ReactNode }) {
    const user = await getUser(params);
    return <div className="row justify-content-center">
        <div className="col-lg-7">
            <div className="d-flex align-items-end mb-3">
                <h1 className="flex-grow-1 border-bottom m-0 pb-1">
                    {user.username}
                    <RoleBadge role={user.role} className="fs-5 ms-3 mb-1 align-text-bottom" />
                </h1>
                <Navigation base={`/users/${user.networkId}`} style="tabs">
                    {{
                        "": "Details",
                        "rooms": "Rooms",
                    }}
                </Navigation>
            </div>
            {children}
        </div>
    </div>;
}