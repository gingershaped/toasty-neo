import { TabbedHeader } from "@/app/_components/Navigation";
import { ReactNode } from "react";
import { getUser, UserParams } from "./user";
import { RoleBadge } from "@/app/_components/UserLink";

export default async function UserDetailsLayout({ params, children }: { params: UserParams, children: ReactNode }) {
    const user = await getUser(params);
    return <div className="row justify-content-center">
        <div className="col-lg-7">
            <TabbedHeader
                base={`/users/${user.networkId}`}
                nav={{
                    "": "Details",
                    "rooms": "Rooms",
                }}
            >
                {user.username}
                <RoleBadge role={user.role} className="fs-5 ms-3 mb-1 align-text-bottom" />
            </TabbedHeader>
            {children}
        </div>
    </div>;
}