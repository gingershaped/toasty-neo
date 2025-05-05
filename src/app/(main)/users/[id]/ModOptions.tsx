"use client";

import { LoadingSubmitButton } from "@/app/_components/LoadingButton";
import { User } from "@/lib/generated/prisma/client";
import { useActionState } from "react";
import { updateModOptions } from "./actions";

export function ModOptions({ targetUser, canChangeRole }: { targetUser: User, canChangeRole: boolean }) {
    const [, editAction] = useActionState<unknown, FormData>((_, form) => updateModOptions(form), null);
    
    return <form className="border border-danger rounded p-2">
        <h5>Moderator options</h5>
        <input type="hidden" name="networkId" value={targetUser.networkId} />
        <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="locked" name="locked" defaultChecked={targetUser.locked} />
            <label className="form-check-label" htmlFor="locked">Lock account</label>
        </div>
        {canChangeRole && <div className="mb-3">
            <label className="form-label" htmlFor="role">Role</label>
            <select className="form-select" name="role" defaultValue={targetUser.role}>
                <option value="UNVERIFIED">Unverified</option>
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="DEVELOPER">Developer</option>
            </select>
        </div>}
        <div className="d-flex justify-content-end gap-2">
            <LoadingSubmitButton
                variant="danger"
                formAction={editAction}
            >Save changes</LoadingSubmitButton>
        </div>
    </form>;
}