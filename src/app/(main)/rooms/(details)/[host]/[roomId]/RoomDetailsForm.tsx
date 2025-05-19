"use client";

import { Room } from "@/lib/generated/prisma/client";
import { RoomEditForm } from "../../../_components/RoomEditForm";
import { checkRoom, deleteRoom, modifyRoom } from "@/app/(main)/rooms/actions";
import { useActionState } from "react";
import { LoadingSubmitButton } from "@/app/_components/LoadingButton";

export default function RoomDetailsForm({ room, canEdit, isModerator, isDeveloper }: { room: Room, canEdit: boolean, isModerator: boolean, isDeveloper: boolean }) {
    const [{ errors: formErrors }, editAction] = useActionState<{ errors: string[] }, FormData>(
        (_, form) => modifyRoom(form), { errors: [] },
    );
    const [, deleteAction] = useActionState<unknown, FormData>((_, form) => deleteRoom(form), null);
    const [, checkAction] = useActionState<unknown, FormData>((_, form) => checkRoom(form), null);

    return <form>
        <input type="hidden" name="host" value={room.host} />
        <input type="hidden" name="roomId" value={room.roomId} />
        <RoomEditForm
            isModerator={isModerator}
            readOnly={!canEdit}
            room={room}
        />
        {canEdit && <>
            <hr />
            <div className="d-flex gap-2">
                {isDeveloper && (
                    <LoadingSubmitButton
                        variant="secondary"
                        formAction={checkAction}
                    >
                        Check now
                    </LoadingSubmitButton>
                )}
                <LoadingSubmitButton
                    variant="danger"
                    formAction={deleteAction}
                >Delete room</LoadingSubmitButton>
                <LoadingSubmitButton
                    variant="primary"
                    formAction={editAction}
                >Save changes</LoadingSubmitButton>
                {formErrors.map((error, index) => <div key={index} className="text-danger">{error}</div>)}
            </div>
        </>}
    </form>;
}