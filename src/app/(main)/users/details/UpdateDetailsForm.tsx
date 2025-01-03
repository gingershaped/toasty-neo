"use client";

import { LoadingButton } from "@/app/_components/LoadingButton";
import { updateDetails } from "./actions";
import { useActionState } from "react";

export function UpdateDetailsForm({ associated }: { associated: { site_name: string, site_url: string }[] }) {
    const [, action, submitting] = useActionState<unknown, FormData>((_, form) => updateDetails(form), null);

    return <form action={action}>
        <div className="mb-3">
            <label className="form-label" htmlFor="site">Which site would you like to copy your details from?</label>
            <select className="form-select" name="site">
                {associated.map(({ site_name: siteName, site_url: siteUrl }) => (
                    <option key={siteUrl} value={siteUrl}>{siteName}</option>
                ))}
            </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
            <LoadingButton
                type="submit"
                variant="primary"
                loading={submitting}
            >Update details</LoadingButton>
        </div>
    </form>;
}