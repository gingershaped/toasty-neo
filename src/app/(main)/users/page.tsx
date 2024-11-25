import { UserLink } from "@/app/_components/UserLink";
import prisma from "@/lib/db";

export default async function UserList() {
    const users = await prisma.user.findMany({ orderBy: { joinedAt: "desc" } });

    return <div className="row justify-content-center">
        <div className="col-lg-10">
            <div className="d-flex align-items-end mb-3">
                <h1 className="flex-grow-1 border-bottom m-0 pb-1">Users</h1>
            </div>
            <div className="list-group">
                {users.map((user, index) => (
                    <div key={index} className="list-group-item">
                        <UserLink user={user} />
                        <div className="text-secondary-emphasis">#{user.networkId}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>;
}