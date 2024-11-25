import { readSessionCookie } from "@/lib/auth/cookie";
import { UPDATE_DETAILS_COOKIE, updateDetailsPayload } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UpdateDetailsForm } from "./UpdateDetailsForm";

export default async function UpdateUserDetails() {
    const { associated } = await readSessionCookie(UPDATE_DETAILS_COOKIE, updateDetailsPayload) ?? redirect("/auth/login?state=details");
    return <div className="row justify-content-center">
        <div className="col-lg-4 border rounded p-4">
            <h4>Update account details</h4>
            <UpdateDetailsForm associated={associated} />
        </div>
    </div>;
}