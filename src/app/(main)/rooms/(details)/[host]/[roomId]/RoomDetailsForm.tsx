"use client";

import { Room } from "@/lib/generated/prisma/client";
import { RoomEditForm } from "../../../_components/RoomEditForm";
import { checkRoom, deleteRoom, modifyRoom } from "@/app/(main)/rooms/actions";
import { useActionState } from "react";
import { LoadingButton } from "@/app/_components/LoadingButton";
import Link from "next/link";
import { HOST_ADDRESSES } from "@/lib/util";

export default function RoomDetailsForm({ room, canEdit, isModerator, isDeveloper }: { room: Room, canEdit: boolean, isModerator: boolean, isDeveloper: boolean }) {
    const [{ errors: formErrors }, editAction, editing] = useActionState<{ errors: string[] }, FormData>(
        (_, form) => modifyRoom(form), { errors: [] },
    );
    const [, deleteAction, deleting] = useActionState<unknown, FormData>((_, form) => deleteRoom(form), null);
    const [, checkAction, checking] = useActionState<unknown, FormData>((_, form) => checkRoom(form), null);
    const busy = editing || deleting || checking;

    return <form>
        <input type="hidden" name="host" value={room.host} />
        <input type="hidden" name="roomId" value={room.roomId} />
        <RoomEditForm
            isModerator={isModerator}
            readOnly={!canEdit}
            locked={room.locked}
            message={room.antifreezeMessage}
            run={room.state == "ACTIVE"}
        />
        {canEdit && <>
            <hr />
            <div className="d-flex gap-2">
                <Link className="me-auto" href={new URL(`/rooms/info/${room.roomId}`, HOST_ADDRESSES[room.host])} target="_blank">view in chat</Link>
                {isDeveloper && (
                    <LoadingButton
                        type="submit"
                        variant="secondary"
                        loading={checking}
                        disabled={busy}
                        formAction={checkAction}
                    >
                        Check now
                    </LoadingButton>
                )}
                <LoadingButton
                    type="submit"
                    variant="danger"
                    loading={deleting}
                    disabled={busy}
                    formAction={deleteAction}
                >Delete room</LoadingButton>
                <LoadingButton
                    type="submit"
                    variant="primary"
                    loading={editing}
                    disabled={busy}
                    formAction={editAction}
                >Save changes</LoadingButton>
                {formErrors.map((error, index) => <div key={index} className="text-danger">{error}</div>)}
            </div>
        </>}
    </form>;
}