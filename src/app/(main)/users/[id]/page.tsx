import Link from "next/link";
import { getUser, UserParams } from "./user";
import { readUserSession } from "@/lib/auth/session";
import dayjs from "dayjs";
import { userCanModerate } from "@/lib/auth/utils";
import { ModOptions } from "./ModOptions";
import { LoadingLink } from "@/app/_components/LoadingButton";

export default async function UserDetails({ params }: { params: UserParams }) {
    const currentUser = await readUserSession();
    const targetUser = await getUser(params);
    return <div>
        <div className="d-flex flex-row justify-content-evenly mb-3">
            <Link href={`https://stackexchange.com/users/${targetUser.networkId}`}>Network profile</Link>
            <Link href={`https://chat.stackexchange.com/accounts/${targetUser.networkId}`}>Chat profile</Link>
        </div>
        <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input type="text" className="form-control" id="username" value={targetUser.username} disabled />
        </div>
        {currentUser?.networkId == targetUser.networkId && (
            <LoadingLink href="/auth/login?state=details" variant="primary" className="mb-3">Update account details</LoadingLink>
        )}
        <div className="mb-3">
            Account created: {dayjs(targetUser.joinedAt).toISOString()}
        </div>
        {(currentUser != null && userCanModerate(currentUser) && (!userCanModerate(targetUser) || currentUser.role == "DEVELOPER")) && <ModOptions targetUser={targetUser} canChangeRole={currentUser.role == "DEVELOPER"} />}
    </div>;
}