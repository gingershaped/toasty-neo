"use client";

import { Room } from "@/lib/generated/prisma/client";
import { RoomEditForm } from "../../../_components/RoomEditForm";
import { checkRoom, deleteRoom, modifyRoom } from "@/app/(main)/rooms/actions";
import { useActionState } from "react";
import { LoadingSubmitButton } from "@/app/_components/LoadingButton";
import { RoomEditLevel } from "../../../_utils/common";

type RoomDetailsFormProps = {
    room: Room,
    editLevel: RoomEditLevel,
};

export default function RoomDetailsForm({ room, editLevel }: RoomDetailsFormProps) {

    const [{ errors: formErrors }, editAction] = useActionState<{ errors: string[] }, FormData>(
        (_, form) => modifyRoom(form), { errors: [] },
    );
    const [, deleteAction] = useActionState<unknown, FormData>((_, form) => deleteRoom(form), null);
    const [, checkAction] = useActionState<unknown, FormData>((_, form) => checkRoom(form), null);

    return <form>
        <input type="hidden" name="host" value={room.host} />
        <input type="hidden" name="roomId" value={room.roomId} />
        <RoomEditForm
            room={room}
            editLevel={editLevel}
        />
        {formErrors.map((error, index) => <div key={index} className="text-danger mt-2">{error}</div>)}
        {editLevel >= RoomEditLevel.USER && <>
            <hr className="my-2" />
            <div className="d-flex gap-2 justify-content-end">
                {editLevel >= RoomEditLevel.DEVELOPER && (
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
            </div>
        </>}
    </form>;
}