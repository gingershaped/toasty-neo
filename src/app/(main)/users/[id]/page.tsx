import Link from "next/link";
import { getUser, UserParams } from "./user";
import { readUserSession } from "@/lib/auth/session";
import dayjs from "dayjs";
import { userCanModerate } from "@/lib/auth/utils";
import { ModOptions } from "./ModOptions";

export default async function UserDetails({ params }: { params: UserParams }) {
    const currentUser = await readUserSession();
    const targetUser = await getUser(params);
    return <div>
        <div className="d-flex flex-column flex-sm-row justify-content-evenly mb-3">
            <Link href={`https://stackexchange.com/users/${targetUser.networkId}`}>Network profile</Link>
            <Link href={`https://chat.stackexchange.com/accounts/${targetUser.networkId}`}>Chat profile</Link>
        </div>
        <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input type="text" className="form-control text-secondary" id="username" value={targetUser.username} readOnly />
        </div>
        {currentUser?.networkId == targetUser.networkId && (
            <Link href="/auth/login?state=details" className="btn btn-primary mb-3">Update account details</Link>
        )}
        <div className="mb-3">
            Account created: {dayjs(targetUser.joinedAt).toISOString()}
        </div>
        {(currentUser != null && userCanModerate(currentUser) && targetUser.role != "DEVELOPER") && <ModOptions targetUser={targetUser} canChangeRole={currentUser.role == "DEVELOPER"} />}
    </div>;
}