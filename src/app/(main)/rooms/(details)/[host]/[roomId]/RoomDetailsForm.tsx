"use client";

import { Room } from "@prisma/client";
import { RoomEditForm } from "../../../_components/RoomEditForm";
import { deleteRoom, modifyRoom } from "@/app/(main)/actions";
import { useActionState } from "react";
import { LoadingButton } from "@/app/_components/LoadingButton";
import Link from "next/link";
import { HOSTS } from "@/lib/chat";

export default function RoomDetailsForm({ room, canEdit, isModerator }: { room: Room, canEdit: boolean, isModerator: boolean }) {
    const [{ errors: formErrors }, editAction, submitting] = useActionState<{ errors: string[] }, FormData>(
        (_, form) => modifyRoom(form), { errors: [] },
    );
    const [, deleteAction, deleting] = useActionState<unknown, FormData>((_, form) => deleteRoom(form), null);

    return <form action={editAction}>
        <input type="hidden" name="host" value={room.host} />
        <input type="hidden" name="roomId" value={room.roomId} />
        <RoomEditForm
            isModerator={isModerator}
            readOnly={!canEdit}
            locked={room.locked}
            message={room.antifreezeMessage}
            run={room.active}
        />
        {canEdit && <>
            <hr />
            <div className="d-flex gap-2">
                <Link className="me-auto" href={new URL(`/rooms/info/${room.roomId}`, HOSTS[room.host])} target="_blank">view in chat</Link>
                <LoadingButton
                    type="submit"
                    variant="danger"
                    loading={deleting}
                    disabled={submitting}
                    formAction={deleteAction}
                >Delete room</LoadingButton>
                <LoadingButton
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    disabled={deleting}
                >Edit room</LoadingButton>
                {formErrors.map((error, index) => <div key={index} className="text-danger">{error}</div>)}
            </div>
        </>}
    </form>;
}