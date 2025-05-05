"use client";

import { LoadingSubmitButton } from "@/app/_components/LoadingButton";
import { updateDetails } from "./actions";
import { useActionState } from "react";

export function UpdateDetailsForm({ associated }: { associated: { site_name: string, site_url: string }[] }) {
    const [, action] = useActionState<unknown, FormData>((_, form) => updateDetails(form), null);

    return <form>
        <div className="mb-3">
            <label className="form-label" htmlFor="site">Which site would you like to copy your details from?</label>
            <select className="form-select" name="site">
                {associated.map(({ site_name: siteName, site_url: siteUrl }) => (
                    <option key={siteUrl} value={siteUrl}>{siteName}</option>
                ))}
            </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
            <LoadingSubmitButton
                variant="primary"
                formAction={action}
            >Update details</LoadingSubmitButton>
        </div>
    </form>;
}